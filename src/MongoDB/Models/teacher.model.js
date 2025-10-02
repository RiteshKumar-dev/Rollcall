import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
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
    teacherId: {
      type: String,
      required: [true, "Teacher ID is required"],
      unique: true,
      trim: true,
    },
    subjects: {
      type: [String],
      required: [true, "At least one subject is required"],
      validate: [(arr) => arr.length > 0, "At least one subject is required"],
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
      match: [/^\d{10}$/, "phone number must be 10 digits"],
    },
  },
  { timestamps: true }
);

const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);
export default Teacher;
