"use client";

import { useRouter } from "next/navigation";

import { allPlans, plans } from "@openstatus/plans";
import { Label, RadioGroup, RadioGroupItem } from "@openstatus/ui";

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
      {plans.map((key) => (
        <div key={key}>
          <RadioGroupItem value={key} id={key} className="peer sr-only" />
          <Label
            htmlFor={key}
            className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground",
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
