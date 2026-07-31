import { ShoppingBag } from "lucide-react";

export default function Logo({ showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500">
        <ShoppingBag className="h-4 w-4 text-white" />
      </div>
      {showText && (
        <span className="text-lg font-semibold text-text-primary">
          B2C <span className="text-primary-400">Store</span>
        </span>
      )}
    </div>
  );
}