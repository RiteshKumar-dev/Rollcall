import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    libraryId: {
      type: String,
      required: [true, "Library ID is required"],
      unique: true,
      trim: true,
    },
    enrollmentNo: {
      type: String,
      required: [true, "Enrollment number is required"],
      unique: true,
      trim: true,
    },
    universityRollNo: {
      type: String,
      required: [true, "University roll number is required"],
      unique: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    sem: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1, "Year must be at least 1"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    yearRange: {
      start: { type: Number, required: [true, "Start year is required"] },
      end: { type: Number, required: [true, "End year is required"] },
    },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
export default Student;
