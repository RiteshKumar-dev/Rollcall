"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import useUserStore from "../../Store/useUserStore";
import Cookies from "js-cookie";

const statusColors = {
  Present: "bg-green-200 text-green-800",
  Absent: "bg-red-200 text-red-800",
  Leave: "bg-yellow-200 text-yellow-800",
};

export default function TeacherAttendance() {
  const [selectedDate, setSelectedDate] = useState("");
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const user = useUserStore((state) => state.user);
  const userdetails =
    useUserStore((state) => state.userdetails) || Cookies.get("userdetails")
      ? JSON.parse(Cookies.get("userdetails"))
      : null;

  useEffect(() => {
    if (!selectedDate) {
      setLectures([]);
      setAttendanceStatus({});
      return;
    }

    const fetchLectures = async () => {
      setLoading(true);
      try {
        const day = new Date(selectedDate).toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day)) {
          toast.info("No lectures on weekends");
          setLectures([]);
          setLoading(false);
          return;
        }

        const { data } = await axios.get(`/api/lectures?day=${day}`);
        if (!data.success || !Array.isArray(data.lectures)) {
          toast.info("No lectures scheduled for this day");
          setLectures([]);
          setLoading(false);
          return;
        }

        const lecturesWithStudents = [];
        for (const lecture of data.lectures) {
          try {
            const { data: response } = await axios.get(
              `/api/studentsbysection-and-semester?semester=${lecture.semester}&section=${lecture.section}`
            );
            const students = Array.isArray(response.students) ? response.students : [];

            // ✅ Only push lecture if there are students
            if (students.length > 0) {
              lecturesWithStudents.push({ ...lecture, students });
            }
          } catch (error) {
            toast.error(`Failed to load students for ${lecture.name}`);
          }
        }

        // ✅ Filtered out lectures with 0 students
        if (lecturesWithStudents.length === 0) {
          toast.info("No lectures with students found for this date");
        }

        setLectures(lecturesWithStudents);

        // Initialize attendance status
        const saved = JSON.parse(localStorage.getItem(`attendance_${selectedDate}`)) || {};
        const initStatus = { ...saved };

        lecturesWithStudents.forEach((lec) => {
          if (!initStatus[lec._id]) initStatus[lec._id] = {};
          lec.students.forEach((stu) => {
            if (!initStatus[lec._id][stu._id]) {
              initStatus[lec._id][stu._id] = "Present";
            }
          });
        });

        setAttendanceStatus(initStatus);
        toast.success(`Loaded ${lecturesWithStudents.length} valid lectures`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load lectures");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [selectedDate]);

  const handleStatusChange = (lectureId, studentId, newStatus) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [lectureId]: { ...prev[lectureId], [studentId]: newStatus },
    }));
  };

  // Call this instead of handleSubmit if you want to modify existing attendance
  const updateAttendance = async (lectureId) => {
    const data = attendanceStatus[lectureId];
    if (!data || Object.keys(data).length === 0) {
      toast.error("No attendance to update");
      return;
    }

    try {
      const response = await axios.post(`/api/attendance/${lectureId}`, {
        date: selectedDate,
        data, // { studentId: "Present" | "Absent" | "Leave" }
      });

      if (response.data.success) {
        toast.success("Attendance updated successfully!");
        // Update localStorage
        const saved = JSON.parse(localStorage.getItem(`attendance_${selectedDate}`)) || {};
        saved[lectureId] = data;
        localStorage.setItem(`attendance_${selectedDate}`, JSON.stringify(saved));
      } else {
        toast.error("Update failed: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error: Unable to update attendance");
    }
  };

  const isSubmitDisabled = (lectureId) => {
    return !attendanceStatus[lectureId] || Object.keys(attendanceStatus[lectureId]).length === 0 || loading;
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Toaster richColors position="top-right" />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Teacher Attendance Dashboard</h1>
        {user && (
          <p className="text-base text-gray-600 dark:text-blue-300">
            Logged in as:{" "}
            <span className="font-semibold">
              {userdetails.firstname} {userdetails.lastname} ({userdetails.teacherId})
            </span>
          </p>
        )}
        <p className="text-xs text-gray-400">Select a date to view or mark your lectures.</p>
      </div>

      <div className="flex justify-center mb-8">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min="2023-01-01"
          max={today}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
          aria-label="Pick date for attendance"
        />
      </div>

      {loading && <div className="text-center text-blue-600">Loading lectures...</div>}

      {!loading && lectures.length === 0 && selectedDate && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No lectures with students found for <span className="underline">{selectedDate}</span>.
        </div>
      )}

      <div className="space-y-10">
        {lectures.map((lecture) => (
          <div
            key={lecture._id}
            className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="bg-blue-600 dark:bg-blue-800 px-6 py-4 text-white">
              <h2 className="text-xl font-semibold">{lecture.name}</h2>
              <div className="text-sm opacity-90 mt-2">
                <span className="font-medium">{lecture.branch}</span> | Sem {lecture.semester}, Section{" "}
                {lecture.section}
                <span className="mx-2">|</span>
                {lecture.entryTime} — {lecture.leavingTime}
              </div>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto rounded">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="py-2 px-4 text-left">Student</th>
                      <th className="py-2 px-4 text-center">Absent</th>
                      <th className="py-2 px-4 text-center">Present</th>
                      <th className="py-2 px-4 text-center">Leave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecture.students.map((student) => (
                      <tr key={student._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-2 px-4 font-medium">
                          {student.firstname} {student.lastname}
                        </td>
                        {["Absent", "Present", "Leave"].map((status) => (
                          <td key={status} className="py-2 px-4 text-center">
                            <input
                              type="radio"
                              name={`att-${lecture._id}-${student._id}`}
                              checked={attendanceStatus[lecture._id]?.[student._id] === status}
                              onChange={() => handleStatusChange(lecture._id, student._id, status)}
                              className={`w-5 h-5 rounded-full border-2 cursor-pointer ${statusColors[status]}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => updateAttendance(lecture._id)}
                disabled={isSubmitDisabled(lecture._id)}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow"
              >
                Save / Update Attendance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
