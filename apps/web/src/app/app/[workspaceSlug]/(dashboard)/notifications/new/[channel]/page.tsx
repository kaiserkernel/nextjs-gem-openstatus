import { ProFeatureAlert } from "@/components/billing/pro-feature-alert";
import { NotificationForm } from "@/components/forms/notification-form";
import { api } from "@/trpc/server";
import { notificationProviderSchema } from "@openstatus/db/src/schema";
import { getLimit } from "@openstatus/plans";
import { notFound } from "next/navigation";

export default async function ChannelPage({
  params,
}: {
  params: { channel: string };
}) {
  const validation = notificationProviderSchema
    .exclude(["pagerduty"])
    .safeParse(params.channel);

  if (!validation.success) notFound();

  const workspace = await api.workspace.getWorkspace.query();

  const provider = validation.data;

  const allowed =
    provider === "sms" ? getLimit(workspace.plan, provider) : true;

  if (!allowed) return <ProFeatureAlert feature="SMS channel notification" />;

  const isLimitReached =
    await api.notification.isNotificationLimitReached.query();

  if (isLimitReached)
    return <ProFeatureAlert feature="More notification channel" />;

  return (
    <NotificationForm
      workspacePlan={workspace.plan}
      nextUrl="../"
      provider={provider}
    />
  );
}
