import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { incrementContentClick } from "@/lib/analytics";
import { RedirectPage } from "@/components/RedirectPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ContentRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  
  const content = await prisma.content.findUnique({
    where: { slug },
    include: {
      links: {
        where: { status: "VERIFIED" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 1,
        include: {
          partner: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!content || content.status !== "PUBLISHED") {
    notFound();
  }

  if (content.links.length === 0) {
    redirect(`/content/${slug}`);
  }

  const link = content.links[0];

  await incrementContentClick(content.id);

  await prisma.contentLink.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } },
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
