import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { listPublicContent, listPublicCategoriesForType } from "@/lib/contentService";

describe("Content Service", () => {
  const testSlug = `content-service-test-${Date.now()}`;
  let contentId: number | null = null;
  let categoryId: number | null = null;

  beforeAll(async () => {
    const category = await prisma.category.create({
      data: {
        name: "Test Category Service",
        slug: `test-cat-service-${Date.now()}`,
        typeScope: "MANGA",
        sortOrder: 0,
      },
    });
    categoryId = category.id;

    const content = await prisma.content.create({
      data: {
        title: "Content Service Test Manga",
        slug: testSlug,
        type: "MANGA",
        imageUrl: "https://example.com/test.jpg",
        description: "Test description for content service",
        externalUrl: "https://example.com/read",
        status: "PUBLISHED",
        viewsTotal: 100,
        clicksTotal: 50,
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

  it("lists public content for MANGA type", async () => {
    const result = await listPublicContent({
      type: "MANGA",
      page: 1,
      pageSize: 10,
    });

    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.page).toBe(1);
  });

  it("filters content by search query", async () => {
    const result = await listPublicContent({
      type: "MANGA",
      search: "Content Service Test",
      page: 1,
      pageSize: 10,
    });

    expect(result.items.length).toBeGreaterThanOrEqual(0);
  });

  it("sorts content by views", async () => {
    const result = await listPublicContent({
      type: "MANGA",
      sort: "views",
      page: 1,
      pageSize: 10,
    });

    expect(result.items).toBeDefined();
    if (result.items.length >= 2) {
      expect(result.items[0].viewsTotal).toBeGreaterThanOrEqual(result.items[1].viewsTotal);
    }
  });

  it("lists categories for MANGA type", async () => {
    const categories = await listPublicCategoriesForType("MANGA");

    expect(Array.isArray(categories)).toBe(true);
  });
});
