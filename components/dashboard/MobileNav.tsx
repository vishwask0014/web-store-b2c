"use client";

import { usePathname } from "next/navigation";
import { Home, Store, Package, ShoppingBag, User } from "lucide-react";

const ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Store", href: "/dashboard/store", icon: Store },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Profile", href: "/profile-settings", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-zinc-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-blue-400" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
