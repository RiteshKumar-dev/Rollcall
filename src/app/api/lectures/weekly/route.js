import dbConnect from "../../../../MongoDB/DB/dbconfig";
import Lecture from "../../../../MongoDB/Models/lecture.model";
import Teacher from "../../../../MongoDB/Models/teacher.model";

export async function POST(req) {
  await dbConnect();

  try {
    const data = await req.json();

    // Validate required fields
    const required = [
      "name",
      "teacher",
      "teacherName",
      "branch",
      "semester",
      "section",
      "day",
      "entryTime",
      "leavingTime",
    ];
    for (const field of required) {
      if (!data[field]) {
        return new Response(JSON.stringify({ success: false, error: `${field} is required` }), { status: 400 });
      }
    }

    // Validate teacher
    const teacher = await Teacher.findOne({ teacherId: data.teacher });
    if (!teacher) {
      return new Response(JSON.stringify({ success: false, error: "Teacher not found" }), { status: 404 });
    }

    // Create lecture
    const lecture = new Lecture({
      name: data.name,
      teacher: teacher._id,
      teacherName: data.teacherName,
      branch: data.branch,
      semester: data.semester,
      section: data.section,
      day: data.day,
      entryTime: data.entryTime,
      leavingTime: data.leavingTime,
    });

    await lecture.save();

    return new Response(JSON.stringify({ success: true, lecture }), { status: 201 });
  } catch (error) {
    console.error("Error saving lecture:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
