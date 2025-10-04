// studentsbysection-and-semester

import dbConnect from "../../../MongoDB/DB/dbconfig";
import Student from "../../../MongoDB/Models/student.model";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");
    const section = searchParams.get("section");

    if (!semester || !section) {
      return new Response(JSON.stringify({ success: false, error: "Semester and section are required" }), {
        status: 400,
      });
    }

    const students = await Student.find({
      semester: Number(semester),
      section: section,
    }).select(
      "id firstname lastname email libraryId enrollmentNo universityRollNo branch semester year phone section yearRange"
    );

    return new Response(JSON.stringify({ success: true, count: students.length, students }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
