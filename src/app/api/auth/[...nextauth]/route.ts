import { authOptions } from "@/app/lib/authOptions";
import NextAuth from "next-auth";
// Ensure correct import path

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
