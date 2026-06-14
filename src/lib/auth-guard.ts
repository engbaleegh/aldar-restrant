import { UserRole } from "@/generated/prisma";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
