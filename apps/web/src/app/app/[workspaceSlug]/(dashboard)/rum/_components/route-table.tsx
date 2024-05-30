import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@openstatus/ui";

import { api } from "@/trpc/server";
import { timeFormater } from "./util";
import { DataTableWrapper } from "./data-table-wrapper";

const RouteTable = async ({ dsn }: { dsn: string }) => {
  const data = await api.tinybird.rumMetricsForApplicationPerPage.query({
    dsn: dsn,
  });
  if (!data) {
    return null;
  }
  console.log(data.length);
  return (
    <div className="">
      <DataTableWrapper data={data} />
    </div>
  );
};

export { RouteTable };
