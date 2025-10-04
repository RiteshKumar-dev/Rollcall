import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    attendance: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        status: {
          type: String,
          enum: ["Present", "Absent", "Leave"],
          default: "Present",
        },
      },
    ],
  },
  { timestamps: true }
);

AttendanceSchema.index({ lectureId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
