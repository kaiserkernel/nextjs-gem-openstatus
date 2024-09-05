import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from "@/app/shared-metadata";
import { Mdx } from "@/components/content/mdx";
import { Timeline } from "@/components/content/timeline";
import { Shell } from "@/components/dashboard/shell";
import {
  Button,
  Pagination,
  PaginationContent,
  PaginationLink,
} from "@openstatus/ui";
import { allChangelogs } from "contentlayer/generated";
import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { z } from "zod";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Changelog",
  openGraph: {
    ...ogMetadata,
    title: "Changelog | OpenStatus",
  },
  twitter: {
    ...twitterMetadata,
    title: "Changelog | OpenStatus",
  },
};

const searchParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number.parseInt(val || "1", 10)),
});

const ITEMS_PER_PAGE = 10;

export default function ChangelogClient({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = searchParamsSchema.safeParse(searchParams);

  const page = search.data?.page;
  const current = !page ? 1 : page;
  const total = Math.ceil(allChangelogs.length / ITEMS_PER_PAGE);

  const changelogs = allChangelogs
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice((current - 1) * ITEMS_PER_PAGE, current * ITEMS_PER_PAGE);

  return (
    <Shell>
      <Timeline
        title="Changelog"
        description="All the latest features, fixes and work to OpenStatus."
        actions={
          <Button variant="outline" size="icon" asChild>
            <a href="/changelog/feed.xml" target="_blank" rel="noreferrer">
              <Rss className="h-4 w-4" />
              <span className="sr-only">RSS feed</span>
            </a>
          </Button>
        }
      >
        {changelogs.map((changelog) => (
          <Timeline.Article
            key={changelog.slug}
            publishedAt={changelog.publishedAt}
            imageSrc={changelog.image}
            title={changelog.title}
            href={`./changelog/${changelog.slug}`}
          >
            <Mdx code={changelog.body.code} />
          </Timeline.Article>
        ))}
        {current && total && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
            <div className="row-span-2" />
            <div className="w-full md:order-2 md:col-span-4">
              <Pagination>
                <PaginationContent>
                  {Array.from({ length: total }).map((_, index) => {
                    return (
                      <PaginationLink
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={index}
                        href={`?page=${index + 1}`}
                        isActive={current === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    );
                  })}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Timeline>
    </Shell>
  );
}
