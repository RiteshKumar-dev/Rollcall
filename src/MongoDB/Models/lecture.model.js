// MongoDB/Models/lecture.model.js
import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lecture name is required"],
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher ID is required"],
    },
    teacherName: {
      type: String,
      required: [true, "Teacher name is required"],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      enum: ["BCA", "B.Tech", "BBA", "MCA", "MBA", "B.Sc", "B.Com", "BA"],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    day: {
      type: String,
      required: [true, "Day is required"],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    entryTime: {
      type: String,
      required: [true, "Entry time is required"],
      validate: {
        validator: (v) => /^\d{2}:\d{2}$/.test(v),
        message: "Entry time must be in HH:mm format",
      },
    },
    leavingTime: {
      type: String,
      required: [true, "Leaving time is required"],
      validate: {
        validator: (v) => /^\d{2}:\d{2}$/.test(v),
        message: "Leaving time must be in HH:mm format",
      },
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.models.Lecture || mongoose.model("Lecture", LectureSchema);
export default Lecture;
