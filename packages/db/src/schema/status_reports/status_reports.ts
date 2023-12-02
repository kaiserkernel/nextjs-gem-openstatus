import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { monitor } from "../monitors";
import { page } from "../pages";
import { workspace } from "../workspaces";

export const statusReportStatus = [
  "investigating",
  "identified",
  "monitoring",
  "resolved",
] as const;

export const statusReport = sqliteTable("status_report", {
  id: integer("id").primaryKey(),
  status: text("status", { enum: statusReportStatus }).notNull(),
  title: text("title", { length: 256 }).notNull(),

  workspaceId: integer("workspace_id").references(() => workspace.id),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const statusReportUpdate = sqliteTable("status_report_update", {
  id: integer("id").primaryKey(),

  status: text("status", statusReportStatus).notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  message: text("message").notNull(),

  statusReportId: integer("status_report_id")
    .references(() => statusReport.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const StatusReportRelations = relations(
  statusReport,
  ({ one, many }) => ({
    monitorsToStatusReports: many(monitorsToStatusReport),
    pagesToStatusReports: many(pagesToStatusReports),
    statusReportUpdates: many(statusReportUpdate),
    workspace: one(workspace, {
      fields: [statusReport.workspaceId],
      references: [workspace.id],
    }),
  }),
);

export const statusReportUpdateRelations = relations(
  statusReportUpdate,
  ({ one }) => ({
    statusReport: one(statusReport, {
      fields: [statusReportUpdate.statusReportId],
      references: [statusReport.id],
    }),
  }),
);

export const monitorsToStatusReport = sqliteTable(
  "status_report_to_monitors",
  {
    monitorId: integer("monitor_id")
      .notNull()
      .references(() => monitor.id, { onDelete: "cascade" }),
    statusReportId: integer("status_report_id")
      .notNull()
      .references(() => statusReport.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey(t.monitorId, t.statusReportId),
  }),
);

export const monitorsToStatusReportRelations = relations(
  monitorsToStatusReport,
  ({ one }) => ({
    monitor: one(monitor, {
      fields: [monitorsToStatusReport.monitorId],
      references: [monitor.id],
    }),
    statusReport: one(statusReport, {
      fields: [monitorsToStatusReport.statusReportId],
      references: [statusReport.id],
    }),
  }),
);

export const pagesToStatusReports = sqliteTable(
  "status_reports_to_pages",
  {
    pageId: integer("page_id")
      .notNull()
      .references(() => page.id, { onDelete: "cascade" }),
    statusReportId: integer("status_report_id")
      .notNull()
      .references(() => statusReport.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey(t.pageId, t.statusReportId),
  }),
);

export const pagesToStatusReportsRelations = relations(
  pagesToStatusReports,
  ({ one }) => ({
    page: one(page, {
      fields: [pagesToStatusReports.pageId],
      references: [page.id],
    }),
    statusReport: one(statusReport, {
      fields: [pagesToStatusReports.statusReportId],
      references: [statusReport.id],
    }),
  }),
);
