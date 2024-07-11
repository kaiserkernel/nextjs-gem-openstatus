import { cn } from "@/lib/utils";
import type * as React from "react";

interface HeroProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string;
  subTitle: string;
}

export function Hero({ title, subTitle, className, ...props }: HeroProps) {
  return (
    <div
      className={cn(
        "mx-auto my-16 flex max-w-xl flex-col items-center gap-4",
        className
      )}
      {...props}
    >
      <h1 className="text-center font-cal text-5xl leading-tight">{title}</h1>
      <h2 className="mx-auto max-w-md text-center text-lg text-muted-foreground md:max-w-xl md:text-xl">
        {subTitle}
      </h2>
    </div>
  );
}
