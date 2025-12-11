import { prisma } from "@/lib/prisma";

type AdSlotProps = {
  position: string;
};

export async function AdSlot({ position }: AdSlotProps) {
  const now = new Date();

  const ads = await prisma.ad.findMany({
    where: {
      position,
      isActive: true,
      OR: [
        {
          startDate: null,
          endDate: null,
        },
        {
          startDate: {
            lte: now,
          },
          endDate: null,
        },
        {
          startDate: null,
          endDate: {
            gte: now,
          },
        },
        {
          startDate: {
            lte: now,
          },
          endDate: {
            gte: now,
          },
        },
      ],
    },
    orderBy: [
      { sortOrder: "asc" },
      { id: "asc" },
    ],
  });

  if (!ads.length) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {ads.map((ad) => {
        if (ad.type === "IMAGE" && ad.imageUrl) {
          const image = (
            <img
              src={ad.imageUrl}
              alt=""
              className="max-h-32 w-full max-w-full object-contain"
            />
          );

          if (ad.targetUrl) {
            return (
              <a
                key={ad.id}
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                {image}
              </a>
            );
          }

          return (
            <div key={ad.id} className="w-full">
              {image}
            </div>
          );
        }

        if (ad.type === "SCRIPT" && ad.scriptCode) {
          return (
            <div
              key={ad.id}
              className="w-full"
              dangerouslySetInnerHTML={{ __html: ad.scriptCode }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
