import dbConnect from "../../../MongoDB/DB/dbconfig";
import Lecture from "../../../MongoDB/Models/lecture.model";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");

  if (!day) {
    return new Response(JSON.stringify({ success: false, error: "Day is required" }), { status: 400 });
  }

  try {
    const lectures = await Lecture.find({ day });
    return new Response(JSON.stringify({ success: true, lectures }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Server error" }), { status: 500 });
  }
}
