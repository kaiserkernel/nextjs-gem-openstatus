import { z } from "zod";

import { MonitorForm } from "@/components/forms/monitor/form";
import { api } from "@/trpc/server";

const searchParamsSchema = z.object({
  section: z.string().optional().default("request"),
});

export default async function EditPage({
  params,
  searchParams,
}: {
  params: { workspaceSlug: string; id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const id = Number(params.id);
  const monitor = await api.monitor.getMonitorById.query({ id });
  const workspace = await api.workspace.getWorkspace.query();

  const monitorNotifications =
    await api.monitor.getAllNotificationsForMonitor.query({ id });

  const notifications =
    await api.notification.getNotificationsByWorkspace.query();

  const pages = await api.page.getPagesByWorkspace.query();

  const tags = await api.monitorTag.getMonitorTagsByWorkspace.query();

  // default is request
  const search = searchParamsSchema.safeParse(searchParams);

  return (
    <MonitorForm
      defaultSection={search.success ? search.data.section : undefined}
      defaultValues={{
        ...monitor,
        pages: pages
          .filter((page) =>
            page.monitorsToPages.map(({ monitorId }) => monitorId).includes(id),
          )
          .map(({ id }) => id),
        notifications: monitorNotifications?.map(({ id }) => id),
        tags: tags
          .filter((tag) =>
            tag.monitor.map(({ monitorId }) => monitorId).includes(id),
          )
          .map(({ id }) => id),
      }}
      plan={workspace?.plan}
      notifications={notifications}
      tags={tags}
      pages={pages}
    />
  );
}
