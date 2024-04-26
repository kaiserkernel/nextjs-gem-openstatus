"use client";

import * as React from "react";
import type { LinkProps } from "next/link";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface TabsContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Partial<TabsContextProps> {}

export function TabsContainer({
  className,
  direction = "horizontal",
  position = "end",
  children,
}: TabsContainerProps) {
  return (
    <TabsContext.Provider value={{ direction, position }}>
      <nav
        className={cn(
          "flex",
          {
            "items-center overflow-x-auto": direction === "horizontal",
          },
          className,
        )}
      >
        <ul
          className={cn("flex", {
            "flex-row": direction === "horizontal",
            "flex-col": direction === "vertical",
          })}
        >
          {children}
        </ul>
      </nav>
    </TabsContext.Provider>
  );
}

export interface TabsLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

export function TabsLink({
  children,
  active,
  className,
  disabled,
  ...props
}: TabsLinkProps) {
  const { direction, position } = useTabs();
  return (
    <li
      className={cn("flex shrink-0 list-none border-transparent", {
        "border-primary": active,
        "pointer-events-none opacity-70": disabled,
        "border-b-2": position === "end" && direction === "horizontal",
        "border-l-2": position === "start" && direction === "vertical",
        // ... missing t, r
      })}
    >
      <Link
        className={cn(
          "text-muted-foreground hover:text-primary rounded-md text-sm font-medium",
          {
            "text-primary": active,
            "px-4 pb-3 pt-2": direction === "horizontal",
            "px-4 py-2.5": direction === "vertical",
          },
          className,
        )}
        {...props}
      >
        {children}
      </Link>
    </li>
  );
}

// --------------

interface TabsContextProps {
  direction: "horizontal" | "vertical";
  position: "start" | "end";
}

const TabsContext = React.createContext<TabsContextProps | null>(null);

const useTabs = () => {
  const tabsContext = React.useContext(TabsContext);

  if (!tabsContext) {
    throw new Error("useTabs has to be used within <TabsContext.Provider>");
  }

  return tabsContext;
};
