"use client";

import React, { useState } from "react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { IconPlus, IconX, IconArrowLeft } from "@tabler/icons-react";

export default function Account() {
  const [role, setRole] = useState(null); // teacher/student
  const [loading, setLoading] = useState(false);

  // Teacher form state
  const [teacherData, setTeacherData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    teacherId: "",
    subjects: [""],
    phone: "",
  });

  // Student form state
  const [studentData, setStudentData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    libraryId: "",
    enrollmentNo: "",
    universityRollNo: "",
    branch: "",
    sem: "",
    year: "",
    section: "",
    yearRange: { start: "", end: "" },
  });

  // Handle input change
  const handleChange = (e, roleType, index = null) => {
    const { name, value } = e.target;

    if (roleType === "teacher") {
      if (name === "subjects") {
        const newSubjects = [...teacherData.subjects];
        newSubjects[index] = value;
        setTeacherData({ ...teacherData, subjects: newSubjects });
      } else {
        setTeacherData({ ...teacherData, [name]: value });
      }
    } else {
      if (name === "yearStart" || name === "yearEnd") {
        setStudentData({
          ...studentData,
          yearRange: { ...studentData.yearRange, [name === "yearStart" ? "start" : "end"]: value },
        });
      } else {
        setStudentData({ ...studentData, [name]: value });
      }
    }
  };

  // Subjects handlers
  const addSubject = () => setTeacherData({ ...teacherData, subjects: [...teacherData.subjects, ""] });
  const removeSubject = (index) => {
    const newSubjects = teacherData.subjects.filter((_, i) => i !== index);
    setTeacherData({ ...teacherData, subjects: newSubjects });
  };

  // Validation
  const validateTeacher = () => {
    const { firstname, lastname, email, teacherId, subjects, phone } = teacherData;
    if (!firstname || !lastname || !email || !teacherId || !phone) {
      toast.error("Please fill all required fields.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email.");
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (!subjects.length || subjects.some((s) => !s.trim())) {
      toast.error("Please add at least one subject.");
      return false;
    }
    return true;
  };

  const validateStudent = () => {
    const {
      firstname,
      lastname,
      email,
      libraryId,
      enrollmentNo,
      universityRollNo,
      branch,
      sem,
      year,
      section,
      yearRange,
    } = studentData;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !libraryId ||
      !enrollmentNo ||
      !universityRollNo ||
      !branch ||
      !sem ||
      !year ||
      !section ||
      !yearRange.start ||
      !yearRange.end
    ) {
      toast.error("Please fill all required fields.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email.");
      return false;
    }
    if (isNaN(yearRange.start) || isNaN(yearRange.end) || Number(yearRange.start) > Number(yearRange.end)) {
      toast.error("Please enter a valid year range.");
      return false;
    }
    return true;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === "teacher") {
        if (!validateTeacher()) return;
        await axios.post("/api/account/teacher", teacherData);
        toast.success("Teacher account submitted successfully!");
      } else {
        if (!validateStudent()) return;
        await axios.post("/api/account/student", studentData);
        toast.success("Student account submitted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-6">
        <div className="flex gap-4">
          <button
            className="px-6 py-3 rounded-md bg-black text-white dark:bg-zinc-900"
            onClick={() => setRole("teacher")}
          >
            Teacher
          </button>
          <button
            className="px-6 py-3 rounded-md bg-gray-200 text-black dark:bg-neutral-700 dark:text-white"
            onClick={() => setRole("student")}
          >
            Student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-6 dark:bg-black mt-12">
      <button
        className="flex items-center gap-1 mb-4 text-sm text-blue-600 dark:text-blue-400"
        onClick={() => setRole(null)}
      >
        <IconArrowLeft size={18} /> Back
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <LabelInputContainer className="flex-1">
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              name="firstname"
              type="text"
              value={role === "teacher" ? teacherData.firstname : studentData.firstname}
              onChange={(e) => handleChange(e, role)}
            />
          </LabelInputContainer>

          <LabelInputContainer className="flex-1">
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              id="lastname"
              name="lastname"
              type="text"
              value={role === "teacher" ? teacherData.lastname : studentData.lastname}
              onChange={(e) => handleChange(e, role)}
            />
          </LabelInputContainer>
        </div>

        <LabelInputContainer>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={role === "teacher" ? teacherData.email : studentData.email}
            onChange={(e) => handleChange(e, role)}
          />
        </LabelInputContainer>

        {role === "teacher" ? (
          <>
            <LabelInputContainer>
              <Label htmlFor="teacherId">Teacher ID</Label>
              <Input
                id="teacherId"
                name="teacherId"
                type="text"
                value={teacherData.teacherId}
                onChange={(e) => handleChange(e, "teacher")}
              />
            </LabelInputContainer>

            <Label className="font-medium">Subjects</Label>
            {teacherData.subjects.map((sub, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  name="subjects"
                  value={sub}
                  onChange={(e) => handleChange(e, "teacher", index)}
                  placeholder="Subject"
                />
                <button type="button" onClick={() => removeSubject(index)} className="text-red-500">
                  <IconX />
                </button>
              </div>
            ))}
            <button type="button" onClick={addSubject} className="flex items-center text-blue-500 mb-2 gap-1">
              <IconPlus /> Add Subject
            </button>

            <LabelInputContainer>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                value={teacherData.phone}
                onChange={(e) => handleChange(e, "teacher")}
              />
            </LabelInputContainer>
          </>
        ) : (
          <>
            <LabelInputContainer>
              <Label htmlFor="libraryId">Library ID</Label>
              <Input
                id="libraryId"
                name="libraryId"
                type="text"
                value={studentData.libraryId}
                onChange={(e) => handleChange(e, "student")}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="enrollmentNo">Enrollment No</Label>
              <Input
                id="enrollmentNo"
                name="enrollmentNo"
                type="text"
                value={studentData.enrollmentNo}
                onChange={(e) => handleChange(e, "student")}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="universityRollNo">University Roll No</Label>
              <Input
                id="universityRollNo"
                name="universityRollNo"
                type="text"
                value={studentData.universityRollNo}
                onChange={(e) => handleChange(e, "student")}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                name="branch"
                type="text"
                value={studentData.branch}
                onChange={(e) => handleChange(e, "student")}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="sem">Semester</Label>
              <Input
                id="sem"
                name="sem"
                type="text"
                value={studentData.sem}
                onChange={(e) => handleChange(e, "student")}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                name="section"
                type="text"
                value={studentData.section}
                onChange={(e) => handleChange(e, "student")}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <Label className="mb-1">Year Range</Label>
              <div className="flex gap-2">
                <Input
                  name="yearStart"
                  type="text"
                  placeholder="Start Year"
                  value={studentData.yearRange.start}
                  onChange={(e) => handleChange(e, "student")}
                />
                <Input
                  name="yearEnd"
                  type="text"
                  placeholder="End Year"
                  value={studentData.yearRange.end}
                  onChange={(e) => handleChange(e, "student")}
                />
              </div>
            </LabelInputContainer>
          </>
        )}

        <button type="submit" disabled={loading} className="mt-4 w-full rounded-md bg-black text-white p-2 font-medium">
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};
