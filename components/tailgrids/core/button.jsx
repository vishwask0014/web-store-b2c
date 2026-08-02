"use client";

import { cn } from "@/utils/cn";
import { cva } from "class-variance-authority";
import { Button as AriaButton } from "react-aria-components";

export const buttonStyles = cva(
  "flex items-center justify-center gap-3 font-medium transition-all duration-150 focus:ring-3 disabled:pointer-events-none [&>svg]:text-current outline-none rounded-xl",
  {
    variants: {
      variant: {
        primary: "",
        danger: "",
        success: "",
        ghost: ""
      },
      appearance: {
        fill: "",
        outline: ""
      },
      iconOnly: {
        true: "",
        false: ""
      },
      size: {
        xs: "text-xs [&>svg]:size-4",
        sm: "text-sm [&>svg]:size-5",
        md: "text-sm [&>svg]:size-5",
        lg: "text-base [&>svg]:size-5"
      }
    },
    compoundVariants: [
      {
        variant: ["primary", "danger", "success"],
        appearance: "fill",
        className:
          "text-text-primary disabled:opacity-40 disabled:bg-bg-surface"
      },
      {
        variant: ["primary", "danger", "success"],
        appearance: "outline",
        className:
          "border disabled:opacity-40 disabled:bg-bg-muted"
      },
      {
        variant: "primary",
        appearance: "fill",
        className:
          "focus:ring-primary-500/30 bg-primary-500 hover:bg-primary-600 text-text-primary shadow-sm"
      },
      {
        variant: "primary",
        appearance: "outline",
        className:
          "border-primary-500 bg-transparent text-primary-500 hover:bg-primary-500/10 focus:ring-primary-500/30"
      },
      {
        variant: "danger",
        appearance: "fill",
        className:
          "bg-danger hover:bg-red-600 focus:ring-red-500/30 text-text-primary"
      },
      {
        variant: "danger",
        appearance: "outline",
        className:
          "border-danger bg-transparent text-danger hover:bg-danger/10 focus:ring-red-500/30"
      },
      {
        variant: "success",
        appearance: "fill",
        className:
          "bg-success hover:bg-emerald-600 focus:ring-emerald-500/30 text-text-primary"
      },
      {
        variant: "success",
        appearance: "outline",
        className:
          "border-success bg-transparent text-success hover:bg-success/10 focus:ring-emerald-500/30"
      },
      {
        variant: "ghost",
        className:
          "focus:ring-primary-500/30 text-text-muted hover:bg-bg-muted hover:text-text-secondary focus:ring-2"
      },
      {
        iconOnly: true,
        size: "xs",
        className: "size-8"
      },
      {
        iconOnly: true,
        size: "sm",
        className: "size-10"
      },
      {
        iconOnly: false,
        size: ["xs", "sm"],
        className: "px-4 py-2"
      },
      {
        iconOnly: true,
        size: "md",
        className: "size-11"
      },
      {
        iconOnly: false,
        size: "md",
        className: "px-5 py-2.5"
      },
      {
        iconOnly: true,
        size: "lg",
        className: "size-12"
      },
      {
        iconOnly: false,
        size: "lg",
        className: "px-6 py-3"
      },
    ],
    defaultVariants: {
      variant: "primary",
      appearance: "fill",
      iconOnly: false,
      size: "md"
    }
  }
);

export function Button({
  variant,
  appearance,
  iconOnly,
  size,
  children,
  className,
  disabled,
  pending,
  ...props
}) {
  return (
    <AriaButton
      className={cn(
        buttonStyles({
          variant,
          appearance,
          iconOnly,
          size
        }),
        className
      )}
      isDisabled={disabled}
      isPending={pending}
      {...props}
    >
      {children}
    </AriaButton>
  );
}
