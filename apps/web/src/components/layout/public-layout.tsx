import { ClerkProvider } from "@clerk/nextjs";

import { MarketingFooter } from "./marketing-footer";
import { PublicHeader } from "./public-header";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-8 p-4 md:p-8">
        <PublicHeader className="mx-auto w-full max-w-4xl" />
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-start justify-center">
          {children}
        </div>
        <MarketingFooter className="mx-auto w-full max-w-4xl" />
      </main>
    </ClerkProvider>
  );
}
