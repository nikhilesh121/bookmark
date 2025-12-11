import { prisma } from "./prisma";

export async function getOrCreateSiteSettings() {
  let settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        siteName: "Bookmark",
      },
    });
  }

  return settings;
}
