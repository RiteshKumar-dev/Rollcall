import dbConnect from "@/MongoDB/DB/dbconfig";
import Student from "@/MongoDB/Models/student.model";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const {
      firstname,
      lastname,
      email,
      libraryId,
      enrollmentNo,
      universityRollNo,
      branch,
      semester,
      year,
      section,
      startYear,
      endYear,
    } = body;

    // Validation
    if (!firstname || !lastname) {
      return new Response(JSON.stringify({ success: false, error: "First name and Last name are required" }), {
        status: 400,
      });
    }
    if (!email && !phone) {
      return new Response(JSON.stringify({ success: false, error: "Email or phone is required" }), { status: 400 });
    }
    if (!libraryId || !enrollmentNo || !universityRollNo || !branch || !semester || !year || !section) {
      return new Response(JSON.stringify({ success: false, error: "All student fields are required" }), {
        status: 400,
      });
    }

    // Check for existing user
    const existingUser = await Student.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: "User already exists" }), { status: 409 });
    }

    // Create student
    const newStudent = await Student.create({
      firstname,
      lastname,
      email,
      phone,
      libraryId,
      enrollmentNo,
      universityRollNo,
      branch,
      semester,
      year,
      section,
      startYear,
      endYear,
      role: "student",
    });

    return new Response(JSON.stringify({ success: true, message: "Student account created", Student: newStudent }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
