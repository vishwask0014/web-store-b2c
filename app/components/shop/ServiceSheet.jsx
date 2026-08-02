"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wrench, X, Clock, Plus, Check, ArrowRight, DollarSign } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ServiceSheet({ product, storeName, open, onClose }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024
  );
  const [addingId, setAddingId] = useState("");
  const [addedId, setAddedId] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const services =
    product.serviceDetails?.length > 0 ? product.serviceDetails : product.services || [];

  const addWithService = async (service) => {
    if (addingId) return;
    setAddingId(service.serviceId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.uniqueProductId,
          quantity: 1,
          serviceId: service.serviceId || undefined,
          storeName: product.storeName || storeName || "",
        }),
      });
      if (res.ok) {
        setAddedId(service.serviceId);
        router.refresh();
        setTimeout(() => setAddedId(""), 1600);
      }
    } finally {
      setAddingId("");
    }
  };

  const price =
    product.discountedPrice > 0 && product.discountedPrice < (product.price || 0)
      ? product.discountedPrice
      : product.price || 0;

  const onDragEnd = (_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 800) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="svc-backdrop"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="svc-sheet"
            role="dialog"
            aria-modal="true"
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={onDragEnd}
            className="fixed z-50 flex flex-col bg-bg-surface border-border-default
              inset-x-0 bottom-0 h-[85dvh] rounded-t-3xl border-t shadow-2xl
              lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[400px] lg:rounded-none lg:border-t-0 lg:border-l"
          >
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3 shrink-0">
              {isMobile && (
                <div className="pointer-events-none absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-border-default" />
              )}
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Wrench className="h-4 w-4 text-primary-500" />
                {services.length} service{services.length === 1 ? "" : "s"} available
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-muted hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-3 border-b border-border-default bg-bg-muted/40 px-4 py-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{product.name}</p>
                <p className="truncate text-xs text-text-muted">
                  {product.storeName || storeName || ""}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-text-primary">${price.toFixed(2)}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid gap-3">
                {services.map((s) => {
                  const busy = addingId === s.serviceId;
                  const added = addedId === s.serviceId;
                  return (
                    <div
                      key={s.serviceId}
                      className="rounded-2xl border border-border-default bg-bg-surface p-4"
                    >
                      <div className="flex items-center gap-3">
                        {s.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.image}
                            alt={s.name}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
                            <Wrench className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-text-primary">{s.name}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1 font-medium text-text-primary">
                              <DollarSign className="h-3 w-3" /> ${(s.charges || 0).toFixed(2)}
                              {s.chargeType === "hourly" && <span className="text-text-muted">/hr</span>}
                            </span>
                            {s.durationMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {s.durationMinutes} min
                              </span>
                            )}
                            <span className="rounded-full bg-bg-muted px-2 py-0.5 capitalize">
                              {s.chargeType === "hourly" ? "Per hour" : "One time"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {s.description && (
                        <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                          {s.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => addWithService(s)}
                        disabled={busy || Boolean(addedId)}
                        className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          added
                            ? "bg-success/15 text-success"
                            : "bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
                        }`}
                      >
                        {busy ? (
                          "Adding…"
                        ) : added ? (
                          <>
                            <Check className="h-4 w-4" /> Added to cart
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" /> Add product with this service
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <Link
                href={`/products/${product.uniqueProductId}`}
                onClick={onClose}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary-500/40 hover:text-primary-400"
              >
                View full product details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
