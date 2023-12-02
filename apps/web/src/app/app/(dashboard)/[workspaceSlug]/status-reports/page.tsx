import * as React from "react";
import Link from "next/link";
import { formatDistance } from "date-fns";

import { Button } from "@openstatus/ui";

import { Container } from "@/components/dashboard/container";
import { Header } from "@/components/dashboard/header";
import { HelpCallout } from "@/components/dashboard/help-callout";
import { Icons } from "@/components/icons";
import { AffectedMonitors } from "@/components/status-update/affected-monitors";
import { Events } from "@/components/status-update/events";
import { StatusBadge } from "@/components/status-update/status-badge";
import { statusDict } from "@/data/incidents-dictionary";
import { api } from "@/trpc/server";
import { ActionButton } from "./_components/action-button";
import { EmptyState } from "./_components/empty-state";

export default async function StatusReportsPage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  const reports = await api.statusReport.getStatusReportByWorkspace.query();
  return (
    <div className="grid min-h-full grid-cols-1 grid-rows-[auto,1fr,auto] gap-6 md:grid-cols-1 md:gap-8">
      <Header
        title="Status Reports"
        description="Overview of all your status reports and updates."
        actions={
          <Button asChild>
            <Link href="./status-reports/edit">Create</Link>
          </Button>
        }
      />
      {Boolean(reports?.length) ? (
        <div className="col-span-full">
          <ul role="list" className="grid gap-4 sm:col-span-6">
            {reports?.map((report, i) => {
              const { label, icon } =
                statusDict[report.status as keyof typeof statusDict];
              const monitors = report.monitorsToStatusReports.map(
                ({ monitor }) => monitor,
              );
              return (
                <li key={i} className="grid gap-2">
                  <time className="text-muted-foreground pl-3 text-xs">
                    {formatDistance(new Date(report.createdAt!), new Date(), {
                      addSuffix: true,
                    })}
                  </time>
                  <Container
                    title={
                      <span className="flex flex-wrap gap-2">
                        {report.title}
                        <StatusBadge status={report.status} />
                      </span>
                    }
                    actions={[
                      <Button key="status-button" variant="outline" size="sm">
                        <Link
                          href={`./status-reports/update/edit?id=${report.id}`}
                        >
                          New Update
                        </Link>
                      </Button>,
                      <ActionButton key="action-button" id={report.id} />,
                    ]}
                  >
                    <div className="grid gap-4">
                      {Boolean(monitors.length) ? (
                        <div>
                          <p className="text-muted-foreground mb-1.5 text-xs">
                            Affected Monitors
                          </p>
                          <AffectedMonitors monitors={monitors} />
                        </div>
                      ) : null}
                      <div>
                        <p className="text-muted-foreground mb-1.5 text-xs">
                          Last Updates
                        </p>
                        {/* Make it ordered by desc and make it toggable if you want the whole history! */}
                        <Events
                          statusReportUpdates={report.statusReportUpdates}
                          editable
                        />
                      </div>
                    </div>
                  </Container>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="col-span-full">
          <EmptyState />
        </div>
      )}
      <div className="mt-8 md:mt-12">
        <HelpCallout />
      </div>
    </div>
  );
}
