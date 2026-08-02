import { cn } from "@/utils/cn";
import {
  DialogTrigger as AriaDialogTrigger,
  ModalOverlay as AriaModalOverlay
} from "react-aria-components";

export function OverlayWrapper({ ...props }) {
  return <AriaDialogTrigger {...props} />;
}

export function Backdrop({ className, isDismissable = true, ...props }) {
  return (
    <AriaModalOverlay
      isDismissable={isDismissable}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
        className
      )}
      {...props}
    />
  );
}
