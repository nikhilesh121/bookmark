import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { GET as getPublicContent } from "@/app/api/public/content/route";
import { GET as getPublicCategories } from "@/app/api/public/categories/route";

describe("Public content APIs", () => {
  const categoryName = `Public Test Category ${Date.now()}`;
  const categorySlug = `public-test-category-${Date.now()}`;
  const contentTitle = `Public Test Anime ${Date.now()}`;

  let categoryId: number | null = null;
  let contentId: number | null = null;

  beforeAll(async () => {
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: categorySlug,
        typeScope: "ANIME",
        sortOrder: 0,
      },
    });

    categoryId = category.id;

    const content = await prisma.content.create({
      data: {
        title: contentTitle,
        slug: `public-test-anime-${Date.now()}`,
        type: "ANIME",
        imageUrl: "https://example.com/test.jpg",
        description: "Test description",
        externalUrl: "https://example.com/watch",
        status: "PUBLISHED",
      },
    });

    contentId = content.id;

    await prisma.contentCategory.create({
      data: {
        contentId: content.id,
        categoryId: category.id,
      },
    });
  });

  afterAll(async () => {
    if (contentId != null) {
      await prisma.contentCategory.deleteMany({ where: { contentId } });
      await prisma.content.deleteMany({ where: { id: contentId } });
    }
    if (categoryId != null) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
  });

  it("returns categories for a given type", async () => {
    const request = new Request("http://localhost/api/public/categories?type=ANIME", {
      method: "GET",
    });

    const response = await getPublicCategories(request);
    expect(response.status).toBe(200);

    const data = (await response.json()) as any[];

    const found = data.find((cat: any) => cat.id === categoryId);
    expect(found).toBeTruthy();
  });

  it("returns content for a given type, with filters", async () => {
    const url = new URL("http://localhost/api/public/content");
    url.searchParams.set("type", "ANIME");
    url.searchParams.set("category", categorySlug);
    url.searchParams.set("q", "Public Test Anime");

    const request = new Request(url.toString(), {
      method: "GET",
    });

    const response = await getPublicContent(request);
    expect(response.status).toBe(200);

    const data = (await response.json()) as any;
    expect(Array.isArray(data.items)).toBe(true);

    const found = data.items.find((item: any) => item.id === contentId);
    expect(found).toBeTruthy();
  });
});
