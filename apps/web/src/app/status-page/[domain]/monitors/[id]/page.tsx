import * as React from "react";
import { notFound } from "next/navigation";
import * as z from "zod";

import { flyRegions } from "@openstatus/db/src/schema";
import type { Region } from "@openstatus/tinybird";
import { OSTinybird } from "@openstatus/tinybird";
import { Separator } from "@openstatus/ui";

import { Header } from "@/components/dashboard/header";
import { CombinedChartWrapper } from "@/components/monitor-charts/combined-chart-wrapper";
import { ButtonReset } from "@/components/monitor-dashboard/button-reset";
import { DatePickerPreset } from "@/components/monitor-dashboard/date-picker-preset";
import { Metrics } from "@/components/monitor-dashboard/metrics";
import { env } from "@/env";
import {
  getMinutesByInterval,
  intervals,
  quantiles,
} from "@/lib/monitor/utils";
import { getPreferredSettings } from "@/lib/preferred-settings/server";
import { api } from "@/trpc/server";

const tb = new OSTinybird({ token: env.TINY_BIRD_API_KEY });

const periods = ["1d", "7d"] as const; // satisfies Period[]

const DEFAULT_QUANTILE = "p95";
const DEFAULT_INTERVAL = "30m";
const DEFAULT_PERIOD = "7d";

/**
 * allowed URL search params
 */
const searchParamsSchema = z.object({
  statusCode: z.coerce.number().optional(),
  cronTimestamp: z.coerce.number().optional(),
  quantile: z.enum(quantiles).optional().default(DEFAULT_QUANTILE),
  interval: z.enum(intervals).optional().default(DEFAULT_INTERVAL),
  period: z.enum(periods).optional().default(DEFAULT_PERIOD),
  regions: z
    .string()
    .optional()
    .transform(
      (value) =>
        value
          ?.trim()
          ?.split(",")
          .filter((i) => flyRegions.includes(i as Region)) ?? flyRegions,
    ),
});

export default async function Page({
  params,
  searchParams,
}: {
  params: { domain: string; id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const id = params.id;
  const search = searchParamsSchema.safeParse(searchParams);
  const preferredSettings = getPreferredSettings();

  const monitor = await api.monitor.getPublicMonitorById.query({
    id: Number(id),
    slug: params.domain,
  });

  if (!monitor || !search.success) {
    return notFound();
  }

  const { period, quantile, interval, regions } = search.data;

  // TODO: work it out easier
  const intervalMinutes = getMinutesByInterval(interval);
  const periodicityMinutes = getMinutesByInterval(monitor.periodicity);

  const isQuantileDisabled = intervalMinutes <= periodicityMinutes;
  const minutes = isQuantileDisabled ? periodicityMinutes : intervalMinutes;

  const metrics = await tb.endpointMetrics(period)({ monitorId: id });

  const data = await tb.endpointChart(period)({
    monitorId: id,
    interval: minutes,
  });

  const metricsByRegion = await tb.endpointMetricsByRegion(period)({
    monitorId: id,
  });

  if (!data || !metrics || !metricsByRegion) return null;

  const isDirty =
    period !== DEFAULT_PERIOD ||
    quantile !== DEFAULT_QUANTILE ||
    interval !== DEFAULT_INTERVAL ||
    flyRegions.length !== regions.length;

  return (
    <div className="relative flex w-full flex-col gap-6">
      <Header
        title={monitor.name}
        description={monitor.description || monitor.url}
      />
      <div className="flex items-center justify-between gap-2">
        <DatePickerPreset defaultValue={period} values={periods} />
        {isDirty ? <ButtonReset /> : null}
      </div>
      <Metrics metrics={metrics} period={period} />
      <Separator className="my-8" />
      <CombinedChartWrapper
        data={data}
        period={period}
        quantile={quantile}
        interval={interval}
        regions={regions as Region[]} // FIXME: not properly reseted after filtered
        monitor={monitor}
        isQuantileDisabled={isQuantileDisabled}
        metricsByRegion={metricsByRegion}
        preferredSettings={preferredSettings}
      />
    </div>
  );
}
