import jwt from "jsonwebtoken";

export const generateOTP = () => {
  try {
    return Math.floor(100000 + Math.random() * 900000).toString();
  } catch (error) {
    console.error("OTP generation failed:", error);
    throw new Error("Failed to generate OTP");
  }
};

export const generateToken = (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "21d",
    });
  } catch (error) {
    console.error("Token generation failed:", error);
    throw new Error("Failed to generate token");
  }
};
