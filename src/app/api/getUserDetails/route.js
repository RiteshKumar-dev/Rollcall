import dbConnect from "../../../MongoDB/DB/dbconfig";
import Teacher from "../../../MongoDB/Models/teacher.model";
import Student from "../../../MongoDB/Models/student.model";

export async function POST(req) {
  await dbConnect();

  try {
    // Parse JSON body
    const { phone, email } = await req.json();

    if (!phone && !email) {
      return new Response(JSON.stringify({ success: false, error: "Phone or email is required" }), { status: 400 });
    }

    // Try finding in Teacher model
    let teacher = null;
    if (phone || email) {
      teacher = await Teacher.findOne({
        $or: [...(phone ? [{ phone: phone.trim() }] : []), ...(email ? [{ email: email.trim() }] : [])],
      });
    }

    if (teacher) {
      return new Response(
        JSON.stringify({
          success: true,
          userType: "teacher",
          profile: {
            id: teacher._id,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            email: teacher.email,
            phone: teacher.phone,
            teacherId: teacher.teacherId,
            subjects: teacher.subjects,
            createdAt: teacher.createdAt,
          },
        }),
        { status: 200 }
      );
    }

    // Try finding in Student model
    let student = null;
    if (phone || email) {
      student = await Student.findOne({
        $or: [...(phone ? [{ phone: phone.trim() }] : []), ...(email ? [{ email: email.trim() }] : [])],
      });
    }

    if (student) {
      return new Response(
        JSON.stringify({
          success: true,
          userType: "student",
          profile: {
            id: student._id,
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            phone: student.phone,
            branch: student.branch,
            semester: student.semester,
            section: student.section,
            enrollmentNo: student.enrollmentNo,
            universityRollNo: student.universityRollNo,
            createdAt: student.createdAt,
          },
        }),
        { status: 200 }
      );
    }

    // Not found in either
    return new Response(JSON.stringify({ success: false, error: "No matching teacher or student found" }), {
      status: 404,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
}
