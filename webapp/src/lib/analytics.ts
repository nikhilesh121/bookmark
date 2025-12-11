import { prisma } from "./prisma";

function getTodayDateKey(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function incrementContentView(contentId: number) {
  const date = getTodayDateKey();

  await prisma.$transaction([
    prisma.contentStats.upsert({
      where: {
        contentId_date: {
          contentId,
          date,
        },
      },
      update: {
        views: {
          increment: 1,
        },
      },
      create: {
        contentId,
        date,
        views: 1,
        clicks: 0,
      },
    }),
    prisma.content.update({
      where: { id: contentId },
      data: {
        viewsTotal: {
          increment: 1,
        },
      },
    }),
  ]);
}

export async function incrementContentClick(contentId: number) {
  const date = getTodayDateKey();

  await prisma.$transaction([
    prisma.contentStats.upsert({
      where: {
        contentId_date: {
          contentId,
          date,
        },
      },
      update: {
        clicks: {
          increment: 1,
        },
      },
      create: {
        contentId,
        date,
        views: 0,
        clicks: 1,
      },
    }),
    prisma.content.update({
      where: { id: contentId },
      data: {
        clicksTotal: {
          increment: 1,
        },
      },
    }),
  ]);
}

type DailyStatsGroup = {
  date: Date;
  _sum: {
    views: number | null;
    clicks: number | null;
  };
};

type ContentStatsGroup = {
  contentId: number;
  _sum: {
    views: number | null;
    clicks: number | null;
  };
};

export async function getAnalyticsOverview(days: number) {
  const rangeDays = days === 30 || days === 90 ? days : 7;

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - (rangeDays - 1));

  const [dailyRaw, groupedRaw] = await Promise.all([
    prisma.contentStats.groupBy({
      by: ["date"],
      where: {
        date: {
          gte: from,
        },
      },
      _sum: {
        views: true,
        clicks: true,
      },
      orderBy: {
        date: "asc",
      },
    }),
    prisma.contentStats.groupBy({
      by: ["contentId"],
      where: {
        date: {
          gte: from,
        },
      },
      _sum: {
        views: true,
        clicks: true,
      },
      orderBy: {
        _sum: {
          clicks: "desc",
        },
      },
      take: 20,
    }),
  ]);

  const daily = dailyRaw as DailyStatsGroup[];
  const grouped = groupedRaw as ContentStatsGroup[];

  const dailyTotals = daily.map((entry: DailyStatsGroup) => ({
    date: entry.date.toISOString().slice(0, 10),
    views: entry._sum.views ?? 0,
    clicks: entry._sum.clicks ?? 0,
  }));

  const contentIds = grouped.map((g: ContentStatsGroup) => g.contentId);

  const contents = contentIds.length
    ? await prisma.content.findMany({
        where: { id: { in: contentIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
        },
      })
    : [];

  const contentById = new Map(contents.map((c) => [c.id, c]));

  const topContent = grouped
    .map((g: ContentStatsGroup) => {
      const content = contentById.get(g.contentId);
      if (!content) return null;
      const totalViews = g._sum.views ?? 0;
      const totalClicks = g._sum.clicks ?? 0;
      const ctr = totalViews > 0 ? totalClicks / totalViews : 0;
      return {
        id: content.id,
        title: content.title,
        slug: content.slug,
        type: content.type,
        totalViews,
        totalClicks,
        ctr,
      };
    })
    .filter(Boolean);

  return {
    rangeDays,
    daily: dailyTotals,
    topContent,
  };
}
