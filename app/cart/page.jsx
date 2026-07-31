"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore } from "@/app/stores/cartStore";
import Link from "next/link";
import { Package, Wrench, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const { items, updateQuantity, removeItem } = useCartStore();

  const total = items.reduce(
    (sum, i) => sum + (i.price + (i.serviceCharge || 0)) * i.quantity,
    0
  );

  return (
    <ShopLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Cart</h1>
            <p className="text-sm text-text-muted mt-1">{items.length} item{items.length === 1 ? "" : "s"} in your cart</p>
          </div>
          <Link
            href="/shop"
            className="text-sm text-primary-400 hover:text-primary-500 font-medium shrink-0"
          >
            Continue shopping &rarr;
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-10 text-center flex flex-col items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-text-muted" />
            <p className="text-sm text-text-muted">Your cart is empty.</p>
            <Link href="/shop" className="text-sm text-primary-400 hover:text-primary-500 font-medium">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {items.map((i) => {
                const key = `${i.productId}|${i.serviceId || ""}`;
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-border-default bg-bg-surface p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary">{i.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{i.storeName || i.storeId}</p>
                      {i.serviceName && (
                        <p className="text-xs text-primary-400 mt-1 flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> + {i.serviceName} (${i.serviceCharge})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="flex items-center gap-1 rounded-xl border border-border-default bg-bg-muted p-1">
                        <button
                          onClick={() => updateQuantity(user?.uid, i.productId, i.serviceId, i.quantity - 1)}
                          className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm text-text-primary">{i.quantity}</span>
                        <button
                          onClick={() => updateQuantity(user?.uid, i.productId, i.serviceId, i.quantity + 1)}
                          className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="w-20 text-right text-sm font-semibold text-text-primary">
                        ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(user?.uid, i.productId, i.serviceId)}
                        className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border-default bg-bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-text-muted">Total</p>
                <p className="text-2xl font-semibold text-text-primary">${total.toFixed(2)}</p>
              </div>
              <Link
                href="/checkout"
                className="rounded-xl bg-primary-500 text-white px-6 py-2.5 text-sm font-medium hover:bg-primary-600 transition-colors text-center"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </ShopLayout>
  );
}