import { notFound } from "next/navigation";

import { ProFeatureAlert } from "@/components/billing/pro-feature-alert";
import { CustomDomainForm } from "@/components/forms/custom-domain-form";
import { api } from "@/trpc/server";

export default async function CustomDomainPage({
  params,
}: {
  params: { workspaceSlug: string; id: string };
}) {
  const id = Number(params.id);
  const page = await api.page.getPageById.query({ id });
  const workspace = await api.workspace.getWorkspace.query();

  const isProPlan = workspace?.plan === "pro";

  if (!page) return notFound();

  if (!isProPlan) return <ProFeatureAlert feature="Custom domains" />;

  return (
    <CustomDomainForm
      defaultValues={{
        customDomain: page.customDomain,
        id: page.id,
      }}
    />
  );
}
