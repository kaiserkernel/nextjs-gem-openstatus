"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import type {
  PublicMonitor,
  StatusReportWithUpdates,
} from "@openstatus/db/src/schema";
import { Button, Separator } from "@openstatus/ui";

import { setPrefixUrl } from "@/app/status-page/[domain]/utils";
import { notEmpty } from "@/lib/utils";
import { Events } from "../status-update/events";
import { Summary } from "../status-update/summary";

// TODO: change layout - it is too packed with data rn

export const StatusReportList = ({
  statusReports,
  monitors,
  context = "all",
}: {
  statusReports: StatusReportWithUpdates[];
  monitors: PublicMonitor[];
  context?: "all" | "latest"; // latest 7 days
}) => {
  const params = useParams<{ domain: string }>();
  const lastWeek = Date.now() - 1000 * 60 * 60 * 24 * 7;

  function getLastWeeksIncidents() {
    return statusReports.filter((incident) => {
      return incident.statusReportUpdates.some(
        (update) => update.date.getTime() > lastWeek,
      );
    });
  }

  const reports = context === "all" ? statusReports : getLastWeeksIncidents();

  reports.sort((a, b) => {
    if (a.updatedAt == undefined) return 1;
    if (b.updatedAt == undefined) return -1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return (
    <>
      {reports?.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-muted-foreground text-sm font-light">
            {context === "all" ? "All incidents" : "Latest incidents"}
          </p>
          <div className="grid gap-8">
            {reports.map((report) => {
              const affectedMonitors = report.monitorsToStatusReports
                .map(({ monitorId }) => {
                  const monitor = monitors.find(({ id }) => monitorId === id);
                  return monitor || undefined;
                })
                .filter(notEmpty);
              return (
                <div key={report.id} className="group grid gap-4 text-left">
                  <div className="flex items-center gap-1">
                    <h3 className="text-xl font-semibold">{report.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="invisible h-7 w-7 group-hover:visible"
                      asChild
                    >
                      <Link
                        href={setPrefixUrl(`/incidents/${report.id}`, params)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <Summary report={report} monitors={affectedMonitors} />
                  <Separator />
                  <Events
                    statusReportUpdates={report.statusReportUpdates}
                    collabsible
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-center text-sm font-light">
          {context === "all"
            ? "No incidents."
            : "No incidents in the last week."}
        </p>
      )}
    </>
  );
};
