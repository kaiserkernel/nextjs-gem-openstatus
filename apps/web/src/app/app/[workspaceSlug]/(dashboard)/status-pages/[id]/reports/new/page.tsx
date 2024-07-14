import { StatusReportForm } from "@/components/forms/status-report/form";
import { api } from "@/trpc/server";

export default async function NewPage({
  params,
}: {
  params: { id: string; reportId: string };
}) {
  const monitors = await api.monitor.getMonitorsByWorkspace.query();

  return (
    <StatusReportForm
      monitors={monitors}
      nextUrl={"./"}
      defaultSection="update-message"
      pageId={Number.parseInt(params.id)}
    />
  );
}
