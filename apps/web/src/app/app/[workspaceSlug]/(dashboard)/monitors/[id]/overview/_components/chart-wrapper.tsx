import type { ResponseGraph } from "@openstatus/tinybird";

import type { Period, Quantile } from "../../utils";
import { Chart } from "./chart";
import { groupDataByTimestamp } from "./utils";

export function ChartWrapper({
  data,
  period,
  quantile,
}: {
  data: ResponseGraph[];
  period: Period;
  quantile: Quantile;
}) {
  const group = groupDataByTimestamp(data, period, quantile);
  return <Chart data={group.data} regions={group.regions} />;
}
