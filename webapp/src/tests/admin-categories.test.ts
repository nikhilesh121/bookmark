import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { GET as getCategories, POST as postCategory } from "@/app/api/admin/categories/route";

vi.mock("@/lib/auth", () => ({
  getCurrentAdmin: vi.fn().mockResolvedValue({
    id: 1,
    name: "Test Admin",
    email: "admin@example.com",
    role: "SUPER_ADMIN",
  }),
}));

describe("Admin categories API", () => {
  const categoryName = `Test Category ${Date.now()}`;
  let createdId: number | null = null;

  afterAll(async () => {
    if (createdId != null) {
      await prisma.contentCategory.deleteMany({ where: { categoryId: createdId } });
      await prisma.category.deleteMany({ where: { id: createdId } });
    }
  });

  it("creates a category via POST and returns it via GET", async () => {
    const request = new Request("http://localhost/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: categoryName,
        typeScope: "MANGA",
        sortOrder: 123,
      }),
    });

    const response = await postCategory(request);
    expect(response.status).toBe(201);

    const created = (await response.json()) as any;
    createdId = created.id;

    expect(created.name).toBe(categoryName);
    expect(created.typeScope).toBe("MANGA");

    const listRequest = new Request("http://localhost/api/admin/categories", {
      method: "GET",
    });

    const listResponse = await getCategories(listRequest);
    expect(listResponse.status).toBe(200);

    const listJson = (await listResponse.json()) as any[];

    const found = listJson.find((cat: any) => cat.id === created.id);
    expect(found).toBeTruthy();
  });
});
