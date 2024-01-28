import { cn } from "@/lib/utils";
import { Background } from "./background";

export function BasicLayout({
  title,
  description,
  children,
  tw,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  tw?: string;
}) {
  return (
    <Background>
      <div tw="flex flex-col h-full w-full px-24">
        <div tw="flex flex-col flex-1 justify-end">
          <div tw="flex flex-col px-12">
            <h1 style={{ fontFamily: "Cal" }} tw="text-6xl">
              {title}
            </h1>
            <p tw="text-slate-600 text-3xl">{description}</p>
          </div>
        </div>
        <div
          tw={cn(
            "flex flex-col justify-center shadow-2xl mt-1 bg-white rounded-t-lg border-t-2 border-r-2 border-l-2 border-slate-200 px-12",
            tw,
          )}
        >
          {children}
        </div>
      </div>
    </Background>
  );
}
