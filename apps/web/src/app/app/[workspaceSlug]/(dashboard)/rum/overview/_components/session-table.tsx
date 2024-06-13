import { api } from "@/trpc/server";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { DataTableWrapper } from "./data-table-wrapper";

const SessionTable = async ({ dsn, path }: { dsn: string; path: string }) => {
  const data = await api.tinybird.sessionRumMetricsForPath.query({
    dsn: dsn,
    period: "24h",
    path: path,
  });

  if (!data) {
    return null;
  }

  return (
    <div>
      <DataTableWrapper data={data} />
    </div>
  );
};

export { SessionTable };
