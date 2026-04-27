import type * as React from "react";
import {
  Tabs as ShadTabs,
  TabsList as ShadTabsList,
  TabsTrigger as ShadTabsTrigger,
  TabsContent as ShadTabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * HatchTabs — dark, cyan-underline variant of shadcn Tabs. Compose-only — the
 * underlying Radix primitives are unchanged so accessibility behavior is
 * identical to `@/components/ui/tabs`.
 */

export const HatchTabs = ShadTabs;

export const HatchTabsList = ({
  className,
  ...rest
}: React.ComponentProps<typeof ShadTabsList>) => (
  <ShadTabsList
    {...rest}
    className={cn(
      "inline-flex h-auto w-full justify-start gap-1 rounded-none border-b border-[rgba(255,255,255,0.07)] bg-transparent p-0",
      className,
    )}
  />
);

export const HatchTabsTrigger = ({
  className,
  ...rest
}: React.ComponentProps<typeof ShadTabsTrigger>) => (
  <ShadTabsTrigger
    {...rest}
    className={cn(
      "relative -mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-3.5 py-3 text-[13.5px] font-semibold text-[#5C6784] shadow-none data-[state=active]:border-[#4DC8E8] data-[state=active]:bg-transparent data-[state=active]:text-[#ECEEF5] data-[state=active]:shadow-none",
      className,
    )}
  />
);

export const HatchTabsContent = ShadTabsContent;
