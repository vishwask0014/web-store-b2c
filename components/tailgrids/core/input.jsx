"use client";

import { cn } from "@/utils/cn";
import { cva } from "class-variance-authority";
import { Input as AriaInput } from "react-aria-components";

const inputStyles = cva(
  "bg-bg-surface peer max-w-full rounded-xl border px-4 py-2.5 text-text-primary placeholder:text-text-placeholder focus:ring-4 disabled:opacity-40 disabled:cursor-not-allowed outline-none",
  {
    variants: {
      state: {
        default:
          "border-border-default focus:border-primary-500 focus:ring-primary-500/20",
        error:
          "border-danger focus:ring-danger/20",
        success:
          "border-success focus:ring-success/20"
      }
    }
  }
);

export function Input({ state = "default", className, ...inputProps }) {
  return (
    <AriaInput
      className={cn(inputStyles({ state }), className)}
      {...inputProps}
    />
  );
}
