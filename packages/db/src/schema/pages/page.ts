import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { pagesToIncidents } from "../incidents";
import { monitorsToPages } from "../monitors";
import { workspace } from "../workspaces";

export const page = sqliteTable("page", {
  id: integer("id").primaryKey(),

  workspaceId: integer("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),

  title: text("title").notNull(), // title of the page
  description: text("description").notNull(), // description of the page
  icon: text("icon", { length: 256 }).default(""), // icon of the page
  slug: text("slug", { length: 256 }).notNull().unique(), // which is used for https://slug.openstatus.dev
  customDomain: text("custom_domain", { length: 256 }).notNull(),
  published: integer("published", { mode: "boolean" }).default(false),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const pageRelations = relations(page, ({ many, one }) => ({
  monitorsToPages: many(monitorsToPages),
  pagesToIncidents: many(pagesToIncidents),
  workspace: one(workspace, {
    fields: [page.workspaceId],
    references: [workspace.id],
  }),
}));
