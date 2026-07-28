"use client";

import { cn } from "@/utils/cn";
import {
  Text,
  type TextProps,
} from "react-aria-components";

export interface DescriptionProps extends TextProps {
  className?: string;
}

export function Description({ className, ...props }: DescriptionProps) {
  return (
    <Text
      slot="description"
      className={cn("text-sm text-text-100", className)}
      {...props}
    />
  );
}
