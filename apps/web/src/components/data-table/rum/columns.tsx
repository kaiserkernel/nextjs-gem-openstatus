"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import type { responseRumPageQuery } from "@openstatus/tinybird/src/validation";
import type { z } from "zod";

export const columns: ColumnDef<z.infer<typeof responseRumPageQuery>>[] = [
  {
    accessorKey: "path",
    header: "Page",
    cell: ({ row }) => {
      return (
        <Link
          href={"./status-reports/overview"}
          className="w-8 max-w-8 hover:underline"
        >
          <span className="truncate">{row.getValue("path")}</span>
        </Link>
      );
    },
  },
  {
    accessorKey: "totalSession",
    header: "Total Session",
    cell: ({ row }) => {
      return <>{row.original.totalSession}</>;
    },
  },
  {
    accessorKey: "cls",
    header: "CLS",
    cell: ({ row }) => {
      return <code>{row.original.cls.toFixed(2)}</code>;
    },
  },
  {
    accessorKey: "fcp",
    header: "FCP",
    cell: ({ row }) => {
      return <code>{row.original.fcp.toFixed(0)}</code>;
    },
  },
  {
    accessorKey: "lcp",
    header: "LCP",
    cell: ({ row }) => {
      return <code>{row.original.lcp.toFixed(0)}</code>;
    },
  },
  {
    accessorKey: "ttfb",
    header: "TTFB",
    cell: ({ row }) => {
      return <code>{row.original.ttfb.toFixed(0)}</code>;
    },
  },
  //   {
  //     accessorKey: "updatedAt",
  //     header: "Last Updated",
  //     cell: ({ row }) => {
  //       return <span>{formatDate(row.getValue("updatedAt"))}</span>;
  //     },
  //   },
];
