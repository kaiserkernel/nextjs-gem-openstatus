"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

import type {
  Incident,
  Maintenance,
  Monitor,
  MonitorTag,
} from "@openstatus/db/src/schema";
import type {
  Monitor as MonitorTracker,
  ResponseTimeMetrics,
} from "@openstatus/tinybird";
import { Tracker } from "@openstatus/tracker";
import {
  Badge,
  Checkbox,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@openstatus/ui";

import { StatusDotWithTooltip } from "@/components/monitor/status-dot-with-tooltip";
import { TagBadgeWithTooltip } from "@/components/monitor/tag-badge-with-tooltip";
import { Bar } from "@/components/tracker/tracker";
import { isActiveMaintenance } from "@/lib/maintenances/utils";

import { Eye, EyeOff, Radio, View } from "lucide-react";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<{
  monitor: Monitor;
  metrics?: ResponseTimeMetrics;
  data?: MonitorTracker[];
  incidents?: Incident[];
  maintenances?: Maintenance[];
  tags?: MonitorTag[];
}>[] = [
  {
    id: "id",
    accessorKey: "id",
    accessorFn: (row) => row.monitor.id,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
  },
  {
    accessorKey: "active",
    accessorFn: (row) => row.monitor.active,
    header: () => (
      <div className="w-4">
        <Radio className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const { active, status } = row.original.monitor;
      const maintenance = isActiveMaintenance(row.original.maintenances);
      return (
        <div className="flex w-4 items-center justify-center">
          <StatusDotWithTooltip
            active={active}
            status={status}
            maintenance={maintenance}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    accessorFn: (row) => row.monitor.name, // used for filtering as name is nested within the monitor object
    header: "Name",
    cell: ({ row }) => {
      const { name, public: _public } = row.original.monitor;
      return (
        <div className="flex gap-2">
          <Link
            href={`./monitors/${row.original.monitor.id}/overview`}
            className="group flex max-w-full items-center gap-2"
          >
            <span className="truncate group-hover:underline">{name}</span>
          </Link>
          {_public ? <Badge variant="secondary">public</Badge> : null}
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const { tags } = row.original;
      return <TagBadgeWithTooltip tags={tags} />;
    },
    filterFn: (row, _id, value) => {
      if (!Array.isArray(value)) return true;
      // REMINDER: if one value is found, return true
      // we could consider restricting it to all the values have to be found
      return value.some((item) =>
        row.original.tags?.some((tag) => tag.name === item),
      );
    },
  },
  {
    accessorKey: "public",
    accessorFn: (row) => row.monitor.public,
    header: () => (
      <div className="w-4">
        <View className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const { public: _public } = row.original.monitor;
      return (
        <>
          {_public ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </>
      );
    },
    filterFn: (row, _id, value) => {
      if (!Array.isArray(value)) return true;
      return value.includes(row.original.monitor.public);
    },
  },
  {
    accessorKey: "tracker",
    header: () => (
      <HeaderTooltip label="Last 7 days" content="UTC time period" />
    ),
    cell: ({ row }) => {
      const tracker = new Tracker({
        data: row.original.data?.slice(0, 7).reverse(),
        incidents: row.original.incidents,
        maintenances: row.original.maintenances,
      });
      return (
        <div className="flex w-24 gap-1">
          {tracker.days?.map((tracker) => (
            <Bar key={tracker.day} className="h-5" {...tracker} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "lastTimestamp",
    header: "Last ping",
    cell: ({ row }) => {
      const timestamp = row.original.metrics?.lastTimestamp;
      if (timestamp) {
        const distance = formatDistanceToNowStrict(new Date(timestamp), {
          addSuffix: true,
        });
        return (
          <div className="flex max-w-[84px] text-muted-foreground sm:max-w-none">
            <span className="truncate">{distance}</span>
          </div>
        );
      }
      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "uptime",
    header: () => (
      <HeaderTooltip label="Uptime" content="Data from the last 24h" />
    ),
    cell: ({ row }) => {
      const { count, ok } = row.original?.metrics || {};
      if (!count || !ok)
        return <span className="text-muted-foreground">-</span>;
      const rounded = Math.round((ok / count) * 10_000) / 100;
      return <DisplayNumber value={rounded} suffix="%" />;
    },
  },
  {
    accessorKey: "p50Latency",
    header: () => (
      <HeaderTooltip label="P50" content="Data from the last 24h" />
    ),
    cell: ({ row }) => {
      const latency = row.original.metrics?.p50Latency;
      if (latency) return <DisplayNumber value={latency} suffix="ms" />;
      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "p95Latency",
    header: () => (
      <HeaderTooltip label="P95" content="Data from the last 24h" />
    ),
    cell: ({ row }) => {
      const latency = row.original.metrics?.p95Latency;
      if (latency) return <DisplayNumber value={latency} suffix="ms" />;
      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <DataTableRowActions row={row} />
        </div>
      );
    },
  },
];

function HeaderTooltip({ label, content }: { label: string; content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="underline decoration-dotted">
          {label}
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DisplayNumber({ value, suffix }: { value: number; suffix: string }) {
  return (
    <span className="font-mono">
      {new Intl.NumberFormat("us").format(value).toString()}
      <span className="font-normal text-muted-foreground text-xs">
        {suffix}
      </span>
    </span>
  );
}
