import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    contact: {
      type: String,
      required: [true, "Contact is required"],
      trim: true,
      index: true, // for faster lookups
    },
    code: {
      type: String,
      required: [true, "OTP code is required"],
      length: [6, "OTP code must be 6 digits"], // assuming 6-digit OTP
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
    },
    attempts: {
      type: Number,
      default: 0, // number of verification attempts
    },
    verified: {
      type: Boolean,
      default: false, // marks whether OTP has been successfully verified
    },
  },
  { timestamps: true }
);

// Optional: auto-remove expired OTPs after `expiresAt`
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
