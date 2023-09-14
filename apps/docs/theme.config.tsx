import type { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>OpenStatus</span>,
  project: {
    link: "https://github.com/openstatusHQ/openstatus",
  },
  chat: {
    link: "https://discord.com/invite/dHD4JtSfsn",
  },
  docsRepositoryBase:
    "https://github.com/openstatusHQ/openstatus/tree/main/apps/docs",
  footer: {
    text: "OpenStatus Documentation",
  },
  head: (
    <>
      <title>OpenStatus Documentation</title>
      <meta
        name="description"
        content="An Open Source monitoring platform for serverless"
      />
      <meta property="og:image" content="https://openstatus.dev/api/og" />
    </>
  ),
  useNextSeoProps() {
    return {
      title: "OpenStatus Documentation",
      titleTemplate: "%s | OpenStatus Documentation",
    };
  },
};

export default config;
