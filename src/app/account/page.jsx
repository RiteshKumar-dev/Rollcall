"use client";

import React, { useState } from "react";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { IconPlus, IconX, IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function Account() {
  const [role, setRole] = useState(null); // teacher/student
  const [loading, setLoading] = useState(false);
  const [visibleFields, setVisibleFields] = useState(5); // initially show 5 fields
  const router = useRouter();

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
    semester: "",
    year: "",
    phone: "",
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

    // If user filled all visible fields, show 5 more
    const currentData = roleType === "teacher" ? teacherData : studentData;
    const flatValues = Object.values(currentData).flatMap((v) => (typeof v === "object" ? Object.values(v) : v));
    const filledCount = flatValues.filter((val) => val && val.toString().trim() !== "").length;

    if (filledCount >= visibleFields && visibleFields < flatValues.length) {
      setVisibleFields((prev) => prev + 5);
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
      semester,
      year,
      phone,
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
      !semester ||
      !phone ||
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
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
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
      router.push("/"); // Redirect to home
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

  // Dynamic field rendering
  const getFields = () => {
    let fields = [];

    if (role === "teacher") {
      fields = [
        { label: "First Name", name: "firstname", value: teacherData.firstname },
        { label: "Last Name", name: "lastname", value: teacherData.lastname },
        { label: "Email", name: "email", value: teacherData.email },
        { label: "Teacher ID", name: "teacherId", value: teacherData.teacherId },
        { label: "Phone", name: "phone", value: teacherData.phone },
      ];
    } else {
      fields = [
        { label: "First Name", name: "firstname", value: studentData.firstname },
        { label: "Last Name", name: "lastname", value: studentData.lastname },
        { label: "Email", name: "email", value: studentData.email },
        { label: "Library ID", name: "libraryId", value: studentData.libraryId },
        { label: "Enrollment No", name: "enrollmentNo", value: studentData.enrollmentNo },
        { label: "University Roll No", name: "universityRollNo", value: studentData.universityRollNo },
        { label: "Branch", name: "branch", value: studentData.branch },
        { label: "Semester", name: "semester", value: studentData.semester },
        { label: "Year", name: "year", value: studentData.year },
        { label: "Phone", name: "phone", value: studentData.phone },
        { label: "Section", name: "section", value: studentData.section },
        { label: "Year Start", name: "yearStart", value: studentData.yearRange.start },
        { label: "Year End", name: "yearEnd", value: studentData.yearRange.end },
      ];
    }

    return fields.slice(0, visibleFields);
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-6 dark:bg-black mt-12">
      <button
        className="flex items-center gap-1 mb-4 text-sm text-blue-600 dark:text-blue-400"
        onClick={() => setRole(null)}
      >
        <IconArrowLeft size={18} /> Back
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {getFields().map((field, index) => (
          <LabelInputContainer key={index}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.value}
              onChange={(e) => handleChange(e, role)}
            />
          </LabelInputContainer>
        ))}

        {role === "teacher" && visibleFields >= 5 && (
          <>
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
