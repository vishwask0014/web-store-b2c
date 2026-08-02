import { cn } from "@/utils/cn";
import { Close } from "@tailgrids/icons";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  Modal as AriaModal,
  Heading
} from "react-aria-components";
import { Button } from "./button";
import { Description } from "./description";

export function Dialog({
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  showCloseButton = true,
  children,
  ...props
}) {
  return (
    <AriaModal
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <AriaDialog
        className={cn(
          "w-full max-w-140 max-sm:max-w-[calc(100%-2rem)] p-6 border border-border-default bg-bg-surface fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-xl outline-none",
          className
        )}
        {...props}
      >
        {({ close }) => (
          <>
            {typeof children === "function" ? children({ close }) : children}
            {showCloseButton && (
              <AriaButton
                onPress={close}
                aria-label="Close"
                className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-md text-text-muted opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none [&>svg]:size-5"
              >
                <Close />
                <span className="sr-only">Close</span>
              </AriaButton>
            )}
          </>
        )}
      </AriaDialog>
    </AriaModal>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <Heading
      slot="title"
      className={cn(
        "text-lg font-semibold leading-none text-text-primary",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({ ...props }) {
  return <Description {...props} />;
}

export function DialogBody({ className, ...props }) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("py-4 text-sm text-text-secondary", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogClose({ ...props }) {
  return <Button slot="close" {...props} />;
}
