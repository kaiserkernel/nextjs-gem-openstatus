"use client";

import { allPlans } from "@openstatus/db/src/schema/plan/config";
import { workspacePlans } from "@openstatus/db/src/schema/workspaces/constants";
import { Label } from "@openstatus/ui/src/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@openstatus/ui/src/components/radio-group";
import { useRouter } from "next/navigation";

import useUpdateSearchParams from "@/hooks/use-update-search-params";
import { cn } from "@/lib/utils";

export function PricingPlanRadio() {
  const updateSearchParams = useUpdateSearchParams();
  const router = useRouter();
  return (
    <RadioGroup
      defaultValue="team"
      className="grid grid-cols-4 gap-4"
      onValueChange={(value) => {
        const searchParams = updateSearchParams({ plan: value });
        router.replace(`?${searchParams}`, { scroll: false });
      }}
    >
      {workspacePlans.map((key) => (
        <div key={key}>
          <RadioGroupItem value={key} id={key} className="peer sr-only" />
          <Label
            htmlFor={key}
            className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
              key === "team" && "bg-muted/50",
            )}
          >
            <span className="text-sm capitalize">{key}</span>
            <span className="mt-1 font-light text-muted-foreground text-xs">
              {allPlans[key].price}€/month
            </span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
