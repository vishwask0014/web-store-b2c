import { ShoppingBag } from "lucide-react";

export default function Logo({ showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-lg shadow-primary-500/30 ring-1 ring-white/10 transition-transform duration-200 hover:scale-105">
        <ShoppingBag className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-text-primary">
          B2C{" "}
          <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
            Store
          </span>
        </span>
      )}
    </div>
  );
}
