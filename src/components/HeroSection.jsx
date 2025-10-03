"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const boxVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, boxShadow: "0 8px 24px rgba(0,0,0,0.11)" },
};

function AnimatedNumber({ value }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const animation = animate(motionValue, value ?? 0, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return animation.stop;
  }, [value]);

  return <motion.span className="text-3xl text-blue-600 dark:text-blue-400 mt-2 transition-all">{rounded}</motion.span>;
}

function StatBox({ title, value, icon, loading, error, isNumeric }) {
  return (
    <motion.div
      className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-gray-900 rounded-2xl shadow-xl px-8 py-10 min-h-[160px] transition-all cursor-pointer ring-2 ring-transparent hover:ring-blue-300"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={boxVariants}
      tabIndex={0}
      aria-label={title}
    >
      <div className="text-5xl mb-2">{icon}</div>
      <div className="text-[1.35rem] font-bold mb-2 tracking-tight">{title}</div>
      {loading ? (
        <div className="text-gray-400 mt-2 animate-pulse">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center mt-3">{error}</div>
      ) : isNumeric ? (
        <AnimatedNumber value={value} />
      ) : (
        <div className="text-xl text-blue-600 dark:text-blue-400 mt-2 font-medium transition-all">{value}</div>
      )}
    </motion.div>
  );
}

export default function HeroSection() {
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [errorStudent, setErrorStudent] = useState("");
  const [errorTeacher, setErrorTeacher] = useState("");

  useEffect(() => {
    setLoadingStudent(true);
    axios
      .get("/api/account/student")
      .then((res) => setStudentCount(res.data.count || res.data.total || res.data.length || 0))
      .catch((err) => setErrorStudent(err.response?.data?.message || "Failed to load students"))
      .finally(() => setLoadingStudent(false));

    setLoadingTeacher(true);
    axios
      .get("/api/account/teacher")
      .then((res) => setTeacherCount(res.data.count || res.data.total || res.data.length || 0))
      .catch((err) => setErrorTeacher(err.response?.data?.message || "Failed to load teachers"))
      .finally(() => setLoadingTeacher(false));
  }, []);

  return (
    <div className="w-full px-2 py-10 flex justify-center">
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-3
          gap-6
          w-full
          max-w-7xl
        "
      >
        <StatBox
          title="Total Students"
          value={studentCount ?? 0}
          icon="🎓"
          loading={loadingStudent}
          error={errorStudent}
          isNumeric={true}
        />
        <StatBox
          title="Total Teachers"
          value={teacherCount ?? 0}
          icon="👩‍🏫"
          loading={loadingTeacher}
          error={errorTeacher}
          isNumeric={true}
        />
        <StatBox title="Welcome to RollCall" value="Attendance Made Simple!" icon="✅" />
      </div>
    </div>
  );
}
