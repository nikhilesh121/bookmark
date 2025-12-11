import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { incrementContentClick } from "@/lib/analytics";
import { RedirectPage } from "@/components/RedirectPage";
import { headers } from "next/headers";

type PageProps = {
  params: Promise<{
    slug: string;
    linkId: string;
  }>;
};

export default async function LinkRedirectPage({ params }: PageProps) {
  const { slug, linkId } = await params;
  
  const content = await prisma.content.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      externalUrl: true,
      status: true,
      directRedirect: true,
    },
  });

  if (!content || content.status !== "PUBLISHED") {
    notFound();
  }

  const link = await prisma.contentLink.findUnique({
    where: { id: Number(linkId) },
    include: {
      partner: {
        select: { name: true },
      },
    },
  });

  if (!link || link.contentId !== content.id || link.status !== "VERIFIED") {
    redirect(`/content/${slug}`);
  }

  await incrementContentClick(content.id);

  await prisma.contentLink.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } },
  });

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || null;
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0] || realIp || null;
  const referrer = headersList.get("referer") || null;

  await prisma.linkClick.create({
    data: {
      linkId: link.id,
      contentId: content.id,
      userAgent,
      ipAddress,
      referrer,
    },
  });

  if (content.directRedirect) {
    redirect(link.url);
  }

  return (
    <RedirectPage 
      title={content.title}
      targetUrl={link.url}
      sourceName={link.partner?.name || link.sourceName}
    />
  );
}
