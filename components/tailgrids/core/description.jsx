"use client";

import { cn } from "@/utils/cn";
import { Text } from "react-aria-components";

export function Description({ className, ...props }) {
  return (
    <Text
      slot="description"
      className={cn("text-sm text-text-100", className)}
      {...props}
    />
  );
}
