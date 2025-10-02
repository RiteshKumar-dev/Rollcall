import jwt from "jsonwebtoken";
import User from "../src/MongoDB/Models/user.model";
import dbConnect from "../src/MongoDB/DB/dbconfig";

export const authenticate = async (req) => {
  await dbConnect();

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: new Response(JSON.stringify({ success: false, error: "No token provided" }), { status: 401 }) };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return { error: new Response(JSON.stringify({ success: false, error: "Invalid token" }), { status: 401 }) };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return { error: new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 401 }) };
    }

    return { user }; // return user if authenticated
  } catch (err) {
    return { error: new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 }) };
  }
};
