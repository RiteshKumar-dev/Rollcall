import dbConnect from "@/MongoDB/DB/dbconfig";
import Teacher from "@/MongoDB/Models/teacher.model";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");

    let query = {};
    if (phone) query.phone = phone.trim();
    if (email) query.email = email.trim();

    if (Object.keys(query).length === 0) {
      return new Response(JSON.stringify({ success: false, message: "No identifier provided" }), { status: 400 });
    }

    const teacher = await Teacher.findOne(query);

    if (!teacher) {
      return new Response(JSON.stringify({ success: false, message: "No teacher found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, teacher }), { status: 200 });
  } catch (error) {
    console.error("Teacher GET error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
