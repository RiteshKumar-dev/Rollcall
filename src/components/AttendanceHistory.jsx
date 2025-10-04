"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import useUserStore from "../../Store/useUserStore";
import Cookies from "js-cookie";

export default function AttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState("");
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useUserStore((state) => state.user);
  const userdetails =
    useUserStore((state) => state.userdetails) ||
    (Cookies.get("userdetails") ? JSON.parse(Cookies.get("userdetails")) : null);

  const statusColors = {
    Present: "bg-green-100 text-green-800",
    Absent: "bg-red-100 text-red-800",
    Leave: "bg-yellow-100 text-yellow-800",
  };

  useEffect(() => {
    if (!selectedDate) {
      setLectures([]);
      return;
    }

    const fetchLectures = async () => {
      setLoading(true);
      try {
        const day = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });
        const { data } = await axios.get(`/api/lectures?day=${day}`);
        if (!data.success || !Array.isArray(data.lectures)) {
          toast.info("No lectures scheduled for this day");
          setLectures([]);
          setLoading(false);
          return;
        }

        const lecturesWithAttendance = [];
        for (const lecture of data.lectures) {
          try {
            const { data: studentsData } = await axios.get(
              `/api/studentsbysection-and-semester?semester=${lecture.semester}&section=${lecture.section}`
            );

            const students = Array.isArray(studentsData.students) ? studentsData.students : [];
            if (students.length === 0) continue;

            const { data: attData } = await axios.get(`/api/attendance/${lecture._id}?date=${selectedDate}`);
            const attMap = {};
            if (attData.success && attData.attendance) {
              attData.attendance.attendance.forEach((a) => {
                attMap[a.studentId] = a.status;
              });
            }

            lecturesWithAttendance.push({ ...lecture, students, attendance: attMap });
          } catch (error) {
            toast.error(`Failed to load data for ${lecture.name}`);
          }
        }

        setLectures(lecturesWithAttendance);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load lectures");
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [selectedDate]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance History</h1>
        {userdetails && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Teacher:{" "}
            <span className="font-semibold">
              {userdetails.firstname} {userdetails.lastname}
            </span>
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">Select a date to view attendance.</p>
      </div>

      {/* Date Picker */}
      <div className="flex justify-center mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min="2023-01-01"
          max={today}
          className="p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-gray-400 w-full sm:w-auto"
        />
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="flex justify-center my-6">
          <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && lectures.length === 0 && selectedDate && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No lectures with students found for <span className="underline">{selectedDate}</span>.
        </div>
      )}

      {/* Lectures */}
      <div className="space-y-6">
        {lectures.map((lecture) => (
          <div
            key={lecture._id}
            className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 p-4 w-full"
          >
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{lecture.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lecture.branch} | Sem {lecture.semester}, Section {lecture.section} | {lecture.entryTime} —{" "}
                {lecture.leavingTime}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-600 dark:text-gray-300 text-sm">
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lecture.students.map((student) => (
                    <tr key={student._id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-3 text-gray-800 dark:text-gray-100">
                        {student.firstname} {student.lastname}
                      </td>
                      <td
                        className={`py-2 px-3 text-center font-semibold rounded ${statusColors[lecture.attendance[student._id]] || "text-gray-500"}`}
                      >
                        {lecture.attendance[student._id] || "Not Marked"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
