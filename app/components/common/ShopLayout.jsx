import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore, initCart } from "@/app/stores/cartStore";
import ProtectedRoute from "./ProtectedRoute";
import StoreHeader from "./StoreHeader";
import { Store, ShoppingCart, Heart, Package, User } from "lucide-react";

if (typeof window !== "undefined") {
  initCart();
}

export default function ShopLayout({ children, requireAuth = false }) {
  const pathname = usePathname();
  const { user, userType } = useAuth();
  const { items, fetchCart } = useCartStore();

  useEffect(() => {
    if (user?.uid) {
      fetchCart(user.uid);
    }
  }, [user?.uid]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const content = (
    <div className="min-h-screen bg-bg-primary">
        <StoreHeader />
        <main className="max-w-6xl mx-auto p-4 md:p-8 pb-24 lg:pb-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-bg-surface/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            {[
              { href: "/shop", label: "Shop", icon: Store },
              { href: "/wishlist", label: "Wishlist", icon: Heart },
              { href: "/cart", label: "Cart", icon: ShoppingCart, badge: count },
              { href: "/orders", label: "Orders", icon: Package },
              { href: "/profile-settings", label: "Profile", icon: User },
            ].map((item) => {
              const active = pathname === item.href || (item.href !== "/shop" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                    active ? "text-primary-400" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <span className="relative">
                    <item.icon className="h-5 w-5" />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
  );

  if (requireAuth) {
    return <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return content;
}