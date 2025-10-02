import dbConnect from "../../../../MongoDB/DB/dbconfig";
import User from "../../../../MongoDB/Models/user.model";
import Otp from "../../../../MongoDB/Models/otp.model";
import { generateOTP, generateToken } from "../../../../util/auth";

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { contact, otp, action = "signup" } = body;

    if (!contact || typeof contact !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Contact is required" }), { status: 400 });
    }

    const normalized = contact.trim();
    let existingUser = await User.findOne({ $or: [{ email: normalized }, { phone: normalized }] });

    if (!otp) {
      // Check account existence based on action
      if (action === "signup" && existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: "Account exists. Use login instead.", code: "ACCOUNT_EXISTS" }),
          { status: 409 }
        );
      }
      if (action === "login" && !existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: "No account found. Please signup.", code: "NOT_FOUND" }),
          { status: 404 }
        );
      }

      // Check existing unverified OTP
      const existingOtp = await Otp.findOne({ contact: normalized, verified: false }).sort({ updatedAt: -1 });
      if (existingOtp && existingOtp.createdAt) {
        const elapsed = Date.now() - new Date(existingOtp.createdAt).getTime();
        if (elapsed < 60000) {
          const wait = Math.ceil((60000 - elapsed) / 1000);
          return new Response(
            JSON.stringify({
              success: false,
              error: `Wait ${wait}s before requesting new OTP`,
              code: "TOO_MANY_REQUESTS",
            }),
            { status: 429 }
          );
        }
      }

      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await Otp.findOneAndUpdate(
        { contact: normalized },
        { code, expiresAt, attempts: 0, verified: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: existingUser ? "OTP sent for login" : "OTP sent for signup",
          code: code || "OTP_SENT",
        }),
        { status: 200 }
      );
    }

    // Verify OTP
    const record = await Otp.findOne({ contact: normalized, code: otp, verified: false });
    if (!record) {
      // Increment attempts for invalid OTP
      await Otp.findOneAndUpdate({ contact: normalized, verified: false }, { $inc: { attempts: 1 } });
      return new Response(JSON.stringify({ success: false, error: "Invalid OTP", code: "INVALID_OTP" }), {
        status: 400,
      });
    }

    if (record.expiresAt < new Date()) {
      return new Response(JSON.stringify({ success: false, error: "OTP expired", code: "EXPIRED_OTP" }), {
        status: 400,
      });
    }

    // Mark OTP as verified
    await Otp.updateOne({ _id: record._id }, { verified: true });

    // Create user if signup
    if (!existingUser) {
      const isEmail = normalized.includes("@");
      existingUser = await User.create(isEmail ? { email: normalized } : { phone: normalized });
    }

    const token = generateToken(existingUser._id);
    await Otp.deleteOne({ _id: record._id });

    return new Response(
      JSON.stringify({
        success: true,
        message: existingUser ? "Login successful" : "User registered",
        token,
        user: existingUser,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return new Response(JSON.stringify({ success: false, error: "Duplicate account", code: "DUPLICATE" }), {
        status: 409,
      });
    }
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
