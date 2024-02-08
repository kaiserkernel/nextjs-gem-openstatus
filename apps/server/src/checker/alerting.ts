import { db, eq, schema } from "@openstatus/db";
import type {
  MonitorFlyRegion,
  MonitorStatus,
} from "@openstatus/db/src/schema";
import {
  selectMonitorSchema,
  selectNotificationSchema,
} from "@openstatus/db/src/schema";
import { flyRegionsDict } from "@openstatus/utils";

import { checkerAudit } from "../utils/audit-log";
import { providerToFunction } from "./utils";

export const triggerAlerting = async ({
  monitorId,
  region,
  statusCode,
  message,
}: {
  monitorId: string;
  region: keyof typeof flyRegionsDict;
  statusCode?: number;
  message?: string;
}) => {
  console.log(`💌 triggerAlerting for ${monitorId}`);
  const notifications = await db
    .select()
    .from(schema.notificationsToMonitors)
    .innerJoin(
      schema.notification,
      eq(schema.notification.id, schema.notificationsToMonitors.notificationId),
    )
    .innerJoin(
      schema.monitor,
      eq(schema.monitor.id, schema.notificationsToMonitors.monitorId),
    )
    .where(eq(schema.monitor.id, Number(monitorId)))
    .all();
  for (const notif of notifications) {
    console.log(
      `💌 sending notification for ${monitorId} and chanel ${notif.notification.provider}`,
    );
    const monitor = selectMonitorSchema.parse(notif.monitor);
    await providerToFunction[notif.notification.provider]({
      monitor,
      notification: selectNotificationSchema.parse(notif.notification),
      region: flyRegionsDict[region].location,
      statusCode,
      message,
    });
    // ALPHA
    await checkerAudit.publishAuditLog({
      id: `monitor:${monitorId}`,
      action: "notification.sent",
      targets: [{ id: monitorId, type: "monitor" }],
      metadata: { provider: notif.notification.provider },
    });
    //
  }
};

export const upsertMonitorStatus = async ({
  monitorId,
  status,
  region,
}: {
  monitorId: string;
  status: MonitorStatus;
  region: MonitorFlyRegion;
}) => {
  await db
    .insert(schema.monitorStatusTable)
    .values({ status, region, monitorId: Number(monitorId) })
    .onConflictDoUpdate({
      target: [
        schema.monitorStatusTable.monitorId,
        schema.monitorStatusTable.region,
      ],
      set: { status, updatedAt: new Date() },
    });
};
