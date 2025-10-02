import dbConnect from "../../../../MongoDB/DB/dbconfig";
import { authenticate } from "../../../../../middleware/auth";

export async function GET(req) {
  await dbConnect();

  const { user, error } = await authenticate(req);
  if (error) return error;

  return new Response(JSON.stringify({ success: true, user }), { status: 200 });
}
