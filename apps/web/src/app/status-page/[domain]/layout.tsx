import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from "@/app/shared-metadata";
import { Shell } from "@/components/dashboard/shell";
import { api } from "@/trpc/server";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import PasswordProtected from "./_components/password-protected";
import { createProtectedCookieKey, setPrefixUrl } from "./utils";

type Props = {
  params: { domain: string };
  children: React.ReactNode;
};

export default async function StatusPageLayout({ children, params }: Props) {
  const page = await api.page.getPageBySlug.query({ slug: params.domain });

  if (!page) return notFound();

  const plan = page.workspacePlan;

  const navigation = [
    {
      label: "Status",
      segment: null,
      href: setPrefixUrl("/", params),
    },
    {
      label: "Maintenances",
      segment: "maintenances",
      href: setPrefixUrl("/maintenances", params),
      disabled: page.maintenances.length === 0,
    },
    {
      label: "Incidents",
      segment: "incidents",
      href: setPrefixUrl("/incidents", params),
    },
    {
      label: "Monitors",
      segment: "monitors",
      href: setPrefixUrl("/monitors", params),
      disabled:
        page.monitors.filter((monitor) => Boolean(monitor.public)).length === 0,
    },
  ];

  // TODO: move to middleware using NextResponse.rewrite keeping the path without using redirect
  // and move the PasswordProtected into a page.tsx
  if (page.passwordProtected) {
    const cookie = cookies();
    const protectedCookie = cookie.get(createProtectedCookieKey(params.domain));
    const password = protectedCookie ? protectedCookie.value : undefined;
    if (password !== page.password) {
      return <PasswordProtected plan={plan} slug={params.domain} />;
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col space-y-6 p-4 md:p-8">
      <Header navigation={navigation} plan={plan} page={page} />
      <main className="flex h-full w-full flex-1 flex-col">
        <Shell className="mx-auto h-full flex-1 px-4 py-4">{children}</Shell>
      </main>
      <Footer plan={plan} />
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await api.page.getPageBySlug.query({ slug: params.domain });

  return {
    ...defaultMetadata,
    title: page?.title,
    description: page?.description,
    icons: page?.icon,
    twitter: {
      ...twitterMetadata,
      images: [
        `/api/og/page?slug=${page?.slug}&passwordProtected=${page?.passwordProtected}`,
      ],
      title: page?.title,
      description: page?.description,
    },
    openGraph: {
      ...ogMetadata,
      images: [
        `/api/og/page?slug=${page?.slug}&passwordProtected=${page?.passwordProtected}`,
      ],
      title: page?.title,
      description: page?.description,
    },
  };
}
