"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const branches = ["BCA", "B.Tech", "BBA", "MCA", "MBA", "B.Sc", "B.Com", "BA"];

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 9; hour <= 16; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    options.push(time);
  }
  return options;
};

const timeOptions = generateTimeOptions();

export default function LectureAddForm() {
  const [formData, setFormData] = useState({
    name: "",
    teacherName: "",
    teacherId: "",
    branch: "BCA",
    semester: "",
    section: "", // Single section
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (
      !formData.name ||
      !formData.teacherName ||
      !formData.teacherId ||
      !formData.branch ||
      !formData.semester ||
      !formData.section ||
      !formData.day
    ) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }

    if (formData.endTime <= formData.startTime) {
      toast.error("End time must be after start time");
      setLoading(false);
      return;
    }

    try {
      const lectureData = {
        name: formData.name,
        teacher: formData.teacherId,
        teacherName: formData.teacherName,
        branch: formData.branch,
        semester: Number(formData.semester),
        section: formData.section,
        day: formData.day,
        entryTime: formData.startTime,
        leavingTime: formData.endTime,
      };

      await axios.post("/api/lectures/weekly", lectureData);
      toast.success("✅ Lecture added successfully!");
      setFormData({
        name: "",
        teacherName: "",
        teacherId: "",
        branch: "BCA",
        semester: "",
        section: "",
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "❌ Failed to add lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Add Single Lecture</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lecture Name */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Lecture Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Database Management System"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Teacher Name */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Teacher Name</label>
          <input
            type="text"
            name="teacherName"
            placeholder="e.g., Anand Kiran"
            value={formData.teacherName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Teacher ID */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Teacher ID</label>
          <input
            type="text"
            name="teacherId"
            placeholder="e.g., ak332255"
            value={formData.teacherId}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Branch</label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Semester</label>
          <input
            type="number"
            name="semester"
            min="1"
            placeholder="e.g., 5"
            value={formData.semester}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Section (Single) */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Section</label>
          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        {/* Day */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Day</label>
          <select
            name="day"
            value={formData.day}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Start Time</label>
          <select
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">End Time</label>
          <select
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            {timeOptions
              .filter((time) => time > formData.startTime)
              .map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
          </select>
          {formData.endTime <= formData.startTime && formData.endTime !== "" && (
            <p className="text-red-500 text-xs mt-1">End time must be after start time</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || formData.endTime <= formData.startTime}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition duration-200 shadow-md"
        >
          {loading ? "Saving..." : "Add Lecture"}
        </button>
      </form>
    </div>
  );
}
