import dbConnect from "../../../../MongoDB/DB/dbconfig";
import User from "../../../../MongoDB/Models/user.model";
import Otp from "../../../../MongoDB/Models/otp.model";
import { generateOTP, generateToken } from "../../../../util/auth";

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { contact, otp } = body;

    if (!contact || typeof contact !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Contact is required" }), { status: 400 });
    }

    const normalized = contact.trim();
    const user = await User.findOne({ $or: [{ email: normalized }, { phone: normalized }] });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Account not found. Signup first", code: "NO_ACCOUNT" }),
        { status: 404 }
      );
    }

    if (!otp) {
      // Check if OTP exists and is not expired yet
      const existingOtp = await Otp.findOne({ contact: normalized, verified: false }).sort({ updatedAt: -1 });

      if (existingOtp && Date.now() - new Date(existingOtp.createdAt).getTime() < 60000) {
        const wait = Math.ceil((60000 - (Date.now() - new Date(existingOtp.createdAt).getTime())) / 1000);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Wait ${wait}s before requesting new OTP`,
            code: "TOO_MANY_REQUESTS",
          }),
          { status: 429 }
        );
      }

      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      await Otp.findOneAndUpdate(
        { contact: normalized },
        { code, expiresAt, attempts: 0, verified: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return new Response(JSON.stringify({ success: true, message: "OTP sent for login", code: code || "OTP_SENT" }), {
        status: 200,
      });
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

    // Mark OTP as verified and delete it
    await Otp.updateOne({ _id: record._id }, { verified: true });

    const token = generateToken(user._id);
    await Otp.deleteOne({ _id: record._id });

    return new Response(JSON.stringify({ success: true, message: "Login successful", token, user }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
