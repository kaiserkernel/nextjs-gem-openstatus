import { createRoute } from "@hono/zod-openapi";
import { and, db, eq, isNotNull } from "@openstatus/db";
import {
  page,
  pageSubscriber,
  statusReport,
  statusReportUpdate,
} from "@openstatus/db/src/schema";
import { getLimit } from "@openstatus/db/src/schema/plan/utils";
import { sendBatchEmailHtml } from "@openstatus/emails/emails/send";
import { HTTPException } from "hono/http-exception";
import { openApiErrorResponses } from "../../../libs/errors/openapi-error-responses";
import { StatusReportUpdateSchema } from "../../statusReportUpdates/schema";
import type { statusReportsApi } from "../index";
import { ParamsSchema, StatusReportSchema } from "../schema";

const postRouteUpdate = createRoute({
  method: "post",
  tags: ["status_report"],
  path: "/:id/update",
  description:
    "Create an status report update. Deprecated, please use /status-report-updates instead.",
  request: {
    params: ParamsSchema,
    body: {
      description: "the status report update",
      content: {
        "application/json": {
          schema: StatusReportUpdateSchema.omit({ id: true }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: StatusReportSchema,
        },
      },
      description: "Status report updated",
    },
    ...openApiErrorResponses,
  },
});

export function registerStatusReportUpdateRoutes(api: typeof statusReportsApi) {
  return api.openapi(postRouteUpdate, async (c) => {
    const input = c.req.valid("json");
    const { id } = c.req.valid("param");
    const workspaceId = c.get("workspaceId");
    const limits = c.get("limits");

    const _statusReport = await db
      .update(statusReport)
      .set({ status: input.status })
      .where(
        and(
          eq(statusReport.id, Number(id)),
          eq(statusReport.workspaceId, Number(workspaceId)),
        ),
      )
      .returning()
      .get();

    if (!_statusReport) {
      throw new HTTPException(404, { message: "Not Found" });
    }

    const _statusReportUpdate = await db
      .insert(statusReportUpdate)
      .values({
        ...input,
        date: new Date(input.date),
        statusReportId: Number(id),
      })
      .returning()
      .get();

    if (getLimit(limits, "notifications") && _statusReport.pageId) {
      const subscribers = await db
        .select()
        .from(pageSubscriber)
        .where(
          and(
            eq(pageSubscriber.pageId, _statusReport.pageId),
            isNotNull(pageSubscriber.acceptedAt),
          ),
        )
        .all();
      const pageInfo = await db
        .select()
        .from(page)
        .where(eq(page.id, _statusReport.pageId))
        .get();
      if (pageInfo) {
        const subscribersEmails = subscribers.map((subscriber) => {
          return {
            to: subscriber.email,
            subject: `New status update for ${pageInfo.title}`,
            html: `<p>Hi,</p><p>${pageInfo.title} just posted an update on their status page:</p><p>New Status : ${statusReportUpdate.status}</p><p>${statusReportUpdate.message}</p></p><p></p><p>Powered by OpenStatus</p><p></p><p></p><p></p><p></p><p></p>
          `,
            from: "Notification OpenStatus <notification@notifications.openstatus.dev>",
          };
        });
        await sendBatchEmailHtml(subscribersEmails);
      }
    }

    const data = StatusReportSchema.parse(_statusReportUpdate);

    return c.json(data, 200);
  });
}
