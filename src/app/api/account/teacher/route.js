import dbConnect from "@/MongoDB/DB/dbconfig";
import Teacher from "@/MongoDB/Models/teacher.model";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { firstname, lastname, email, phone, teacherId, subjects } = body;

    // Validation
    if (!firstname || !lastname) {
      return new Response(JSON.stringify({ success: false, error: "First name and Last name are required" }), {
        status: 400,
      });
    }
    if (!email && !phone) {
      return new Response(JSON.stringify({ success: false, error: "Email or phone is required" }), { status: 400 });
    }
    if (!teacherId) {
      return new Response(JSON.stringify({ success: false, error: "Teacher ID is required" }), { status: 400 });
    }
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "At least one subject is required" }), {
        status: 400,
      });
    }

    // Check for existing user
    const existingUser = await Teacher.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: "User already exists" }), { status: 409 });
    }

    // Create teacher
    const newTeacher = await Teacher.create({
      firstname,
      lastname,
      email,
      phone,
      teacherId,
      subjects,
      role: "teacher",
    });

    return new Response(JSON.stringify({ success: true, message: "Teacher account created", Teacher: newTeacher }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}

// GET - Return all teachers
export async function GET() {
  await dbConnect();

  try {
    const teachers = await Teacher.find({});
    return new Response(JSON.stringify({ success: true, count: teachers.length, teachers }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
