import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { prisma } from "./prisma";
import { ADMIN_SESSION_COOKIE_NAME, getAdminJwtSecretKey } from "./authConfig";

export type AuthenticatedAdmin = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "EDITOR";
};

async function verifyAdminJwt(token: string) {
  const secretKey = getAdminJwtSecretKey();
  const { payload } = await jwtVerify(token, secretKey);
  return payload as { sub?: string | number; role?: string };
}

export async function getCurrentAdmin(): Promise<AuthenticatedAdmin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAdminJwt(token);
    if (!payload.sub) {
      return null;
    }

    const id = Number(payload.sub);
    if (!Number.isFinite(id)) {
      return null;
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!admin || admin.status !== "ACTIVE") {
      return null;
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  } catch {
    return null;
  }
}
