"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "next/navigation";
import { Slash } from "lucide-react";

import { SelectWorkspace } from "@/components/workspace/select-workspace";
import { pagesConfig } from "@/config/pages";
import { notEmpty } from "@/lib/utils";
import { api } from "@/trpc/client";

export function Breadcrumbs() {
  const params = useParams();
  // const selectedSegment = useSelectedLayoutSegment();
  // const selectedSegments = useSelectedLayoutSegments();
  // const label = useIdLabel();

  // // remove route groups like '(overview)' from the segments
  // const segmentsWithoutRouteGroup = selectedSegments.filter(
  //   (segment) => !segment.startsWith("("),
  // );

  // const isRoot = segmentsWithoutRouteGroup.length <= 1;

  // const page = pagesConfig.find(({ segment }) => segment === selectedSegment);
  const breadcrumbs = [
    // !isRoot ? page?.title : null,
    // label,
  ].filter(notEmpty);

  const isWorkspaceSlug = params.workspaceSlug;

  return (
    <div className="flex items-center">
      <Link href="/app" className="shrink-0">
        <Image
          src="/icon.png"
          alt="OpenStatus"
          height={30}
          width={30}
          className="border-border rounded-full border"
        />
      </Link>
      <Slash className="text-muted-foreground ml-2.5 mr-0.5 h-4 w-4 -rotate-12" />
      {params.workspaceSlug ? (
        <div className="w-40">
          <SelectWorkspace />
        </div>
      ) : null}
      {breadcrumbs.map((breadcrumb) => (
        <Fragment key={breadcrumb}>
          <Slash className="text-muted-foreground ml-0.5 mr-2.5 h-4 w-4 -rotate-12" />
          <p className="text-primary rounded-md text-sm font-medium">
            {breadcrumb}
          </p>
        </Fragment>
      ))}
    </div>
  );
}

// This is a custom hook that returns the label of the current id
function useIdLabel() {
  const params = useParams();
  const selectedSegment = useSelectedLayoutSegment();
  const selectedSegments = useSelectedLayoutSegments();
  const [label, setLabel] = useState<string>();

  // remove route groups like '(overview)' from the segments
  const segmentsWithoutRouteGroup = selectedSegments.filter(
    (segment) => !segment.startsWith("("),
  );

  const isRoot = segmentsWithoutRouteGroup.length <= 1;

  useEffect(() => {
    async function getInfos() {
      const { id } = params;
      if (!isRoot && id) {
        if (selectedSegment === "monitors") {
          const monitor = await api.monitor.getMonitorById.query({
            id: Number(id),
          });
          if (monitor) setLabel(monitor.name);
        }
        if (selectedSegment === "status-pages") {
          const statusPage = await api.page.getPageById.query({
            id: Number(id),
          });
          if (statusPage) setLabel(statusPage.title);
        }
      }
      if (isRoot && label) {
        setLabel(undefined);
      }
    }
    getInfos();
  }, [params, selectedSegment, selectedSegments]);

  return label;
}
