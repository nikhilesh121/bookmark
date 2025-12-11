import { beforeAll, afterAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { POST as loginPost } from "@/app/api/admin/login/route";

describe("Admin login API", () => {
  const email = `test-admin-${Date.now()}@example.com`;
  const password = "TestPassword123!";
  let adminId: number | null = null;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.adminUser.create({
      data: {
        name: "Test Admin",
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    adminId = admin.id;
  });

  afterAll(async () => {
    if (adminId != null) {
      await prisma.adminUser.deleteMany({ where: { id: adminId } });
    }
  });

  it("logs in with valid credentials and sets cookie", async () => {
    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const response = await loginPost(request);

    expect(response.status).toBe(200);

    const json = (await response.json()) as any;
    expect(json.email).toBe(email);
    expect(json.role).toBe("SUPER_ADMIN");

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie.includes("admin_session=")).toBe(true);
  });

  it("rejects invalid password", async () => {
    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: "wrong-password" }),
    });

    const response = await loginPost(request);

    expect(response.status).toBe(401);
  });
});
