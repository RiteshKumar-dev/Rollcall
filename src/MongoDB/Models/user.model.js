import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exists"],
      sparse: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    phone: {
      type: String,
      unique: [true, "Phone number already exists"],
      sparse: true,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{7,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
  },
  { timestamps: true }
);

// Indexes for uniqueness
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
