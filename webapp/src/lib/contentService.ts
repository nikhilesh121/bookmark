import { prisma } from "./prisma";

export type PublicContentSort = "az" | "new" | "views";

export async function listPublicContent(options: {
  type: "MANGA" | "ANIME" | "MOVIE";
  categorySlug?: string;
  search?: string;
  sort?: PublicContentSort;
  page?: number;
  pageSize?: number;
}) {
  const {
    type,
    categorySlug,
    search,
    sort = "new",
    page = 1,
    pageSize = 24,
  } = options;

  const where: Parameters<typeof prisma.content.findMany>[0]["where"] = {
    status: "PUBLISHED",
    type,
  };

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (categorySlug) {
    where.categories = {
      some: {
        category: {
          slug: categorySlug,
        },
      },
    };
  }

  let orderBy: Parameters<typeof prisma.content.findMany>[0]["orderBy"];
  if (sort === "az") {
    orderBy = { title: "asc" };
  } else if (sort === "views") {
    orderBy = { viewsTotal: "desc" };
  } else {
    orderBy = { createdAt: "desc" };
  }

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function listPublicCategoriesForType(type: "MANGA" | "ANIME" | "MOVIE") {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { typeScope: type },
        { typeScope: "UNIVERSAL" },
      ],
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return categories;
}
