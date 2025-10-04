import dbConnect from "../../../../MongoDB/DB/dbconfig";
import Attendance from "../../../../MongoDB/Models/attendance.model";

export async function POST(req, { params }) {
  await dbConnect();
  try {
    const { lectureId } = params;
    if (!lectureId)
      return new Response(JSON.stringify({ success: false, message: "Lecture ID required" }), { status: 400 });

    const { date, data } = await req.json();
    if (!date || !data || Object.keys(data).length === 0)
      return new Response(JSON.stringify({ success: false, message: "Date and attendance data required" }), {
        status: 400,
      });

    const attendanceArray = Object.keys(data).map((studentId) => ({
      studentId,
      status: data[studentId],
    }));

    const attendance = await Attendance.findOneAndUpdate(
      { lectureId, date },
      { attendance: attendanceArray },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return new Response(JSON.stringify({ success: true, attendance }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error", error: error.message }), {
      status: 500,
    });
  }
}

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const { lectureId } = params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!lectureId || !date)
      return new Response(JSON.stringify({ success: false, message: "Lecture ID and date are required" }), {
        status: 400,
      });

    const attendance = await Attendance.findOne({ lectureId, date });
    return new Response(JSON.stringify({ success: true, attendance: attendance || null }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error", error: error.message }), {
      status: 500,
    });
  }
}
