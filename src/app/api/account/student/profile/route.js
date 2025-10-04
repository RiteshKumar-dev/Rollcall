import dbConnect from "@/MongoDB/DB/dbconfig";
import Student from "@/MongoDB/Models/student.model";

export async function GET(req) {
  await dbConnect();

  try {
    // Extract query params
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");

    // Require at least phone or email
    if (!phone && !email) {
      return new Response(JSON.stringify({ success: false, message: "Email or phone required" }), { status: 400 });
    }

    // Construct query
    const query = {};
    if (phone) query.phone = phone.trim();
    if (email) query.email = email.trim();

    // Return only one student
    const student = await Student.findOne(query);

    if (!student) {
      return new Response(JSON.stringify({ success: false, message: "No student found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, student }), { status: 200 });
  } catch (error) {
    console.error("Student GET error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
