"use client";

import * as React from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { Eye, Info } from "lucide-react";

import type { Monitor } from "@openstatus/tinybird";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useWindowSize from "@/hooks/use-window-size";
import { blacklistDates, getMonitorList, getStatus } from "@/lib/tracker";

// What would be cool is tracker that turn from green to red  depending on the number of errors
const tracker = cva("h-10 rounded-full flex-1", {
  variants: {
    variant: {
      up: "bg-green-500 data-[state=open]:bg-green-600",
      down: "bg-red-500 data-[state=open]:bg-red-600",
      degraded: "bg-yellow-500 data-[state=open]:bg-yellow-600",
      empty: "bg-muted-foreground/20",
      blacklist: "bg-green-400",
    },
  },
  defaultVariants: {
    variant: "empty",
  },
});

interface TrackerProps {
  data: Monitor[];
  url: string;
  id: string | number;
  name: string;
  description?: string;
  context?: "play" | "status-page"; // TODO: we might need to extract those two different use cases - for now it's ok I'd say.
}

export function Tracker({
  data,
  url,
  id,
  name,
  context = "play",
  description,
}: TrackerProps) {
  const { isMobile } = useWindowSize();
  const maxSize = React.useMemo(() => (isMobile ? 35 : 45), [isMobile]); // TODO: it is better than how it is currently, but creates a small content shift on first render
  const { monitors, placeholder, uptime } = getMonitorList(data, {
    maxSize,
    context,
  });

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="text-foreground font-semibold">{name}</p>
          {description ? (
            <MoreInfo {...{ url, id, context, description }} />
          ) : null}
        </div>
        <p className="text-muted-foreground font-light">{uptime}% uptime</p>
      </div>
      <div className="relative h-full w-full">
        <div className="flex gap-0.5">
          {Array(placeholder.length - monitors.length)
            .fill(null)
            .map((_, i) => {
              // TODO: use `Bar` component and `HoverCard` with empty state
              return <div key={i} className={tracker({ variant: "empty" })} />;
            })}
          {monitors.map((props) => {
            return (
              <Bar key={props.cronTimestamp} context={context} {...props} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const MoreInfo = ({
  url,
  id,
  context,
  description,
}: Pick<TrackerProps, "url" | "id" | "context" | "description">) => {
  const [open, setOpen] = React.useState(false);
  const formattedURL = new URL(url);
  const link = `${formattedURL.host}${formattedURL.pathname}`;

  if (description == null && context !== "play") {
    return;
  }

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger onClick={() => setOpen(true)} asChild>
          <Info className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-muted-foreground">
            {context === "play" ? (
              <Link href={`/monitor/${id}`} className="hover:text-foreground">
                {link}
              </Link>
            ) : (
              description
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Bar = ({
  count,
  ok,
  avgLatency,
  cronTimestamp,
  context,
}: Monitor & Pick<TrackerProps, "context">) => {
  const [open, setOpen] = React.useState(false);
  const ratio = ok / count;
  // FIX: this is an easy way to detect if cronTimestamps have been aggregated
  const isMidnight = String(cronTimestamp).endsWith("00000");
  const date = new Date(cronTimestamp);
  const toDate = isMidnight ? date.setDate(date.getDate() + 1) : cronTimestamp;
  const dateFormat = isMidnight ? "dd/MM/yy" : "dd/MM/yy HH:mm";

  const isBlackListed = Object.keys(blacklistDates).includes(
    String(cronTimestamp),
  );

  return (
    <HoverCard
      openDelay={100}
      closeDelay={100}
      open={open}
      onOpenChange={setOpen}
    >
      <HoverCardTrigger onClick={() => setOpen(true)} asChild>
        <div
          className={tracker({
            variant: isBlackListed ? "blacklist" : getStatus(ratio).variant,
          })}
        />
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-64">
        {isBlackListed ? (
          <p className="text-muted-foreground text-xs">
            {blacklistDates[cronTimestamp]}
          </p>
        ) : (
          <>
            <div className="flex justify-between">
              <p className="text-sm font-semibold">{getStatus(ratio).label}</p>
              {context === "play" ? (
                <Link
                  href={`/monitor/openstatusPing?fromDate=${cronTimestamp}&toDate=${toDate}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <div className="flex justify-between">
              <p className="text-xs font-light">
                {format(new Date(cronTimestamp), dateFormat)}
              </p>
              <p className="text-muted-foreground text-xs">
                avg. <span className="font-mono">{avgLatency}ms</span>
              </p>
            </div>
            <Separator className="my-1.5" />
            <div className="grid grid-cols-2">
              <p className="text-left text-xs">
                <span className="font-mono text-green-600">{count}</span>{" "}
                <span className="text-muted-foreground font-light">
                  total requests
                </span>
              </p>
              <p className="text-right text-xs">
                <span className="font-mono text-red-600">{count - ok}</span>{" "}
                <span className="text-muted-foreground font-light">
                  failed requests
                </span>
              </p>
            </div>
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
