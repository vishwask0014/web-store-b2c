"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  X,
  Clock,
  Plus,
  Check,
  DollarSign,
  Truck,
  Store,
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProductSheet({ product, storeName, open, onClose }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024
  );
  const [addingId, setAddingId] = useState("");
  const [addedId, setAddedId] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);
  const [addedProduct, setAddedProduct] = useState(false);
  const [active, setActive] = useState(0);
  const touchX = useRef(null);

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

  useEffect(() => {
    if (!open) return;
    fetch(`/api/products/${product.uniqueProductId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view" }),
    }).catch(() => {});
  }, [open, product.uniqueProductId]);

  useEffect(() => {
    if (!open) setActive(0);
  }, [open]);

  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const services =
    product.serviceDetails?.length > 0 ? product.serviceDetails : product.services || [];
  const price = product.price || 0;
  const discounted = product.discountedPrice > 0 && product.discountedPrice < price;
  const finalPrice = discounted ? product.discountedPrice : price;
  const pctOff = discounted ? Math.round(((price - product.discountedPrice) / price) * 100) : 0;
  const quantity = product.quantity ?? 0;
  const outOfStock = quantity === 0;
  const lowStock = quantity > 0 && quantity <= 5;
  const address = product.storeAddress || {};
  const storeNameLabel = product.storeName || storeName || "";

  const addProductToCart = async () => {
    if (addingProduct || outOfStock) return;
    setAddingProduct(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.uniqueProductId,
          quantity: 1,
          storeName: storeNameLabel,
        }),
      });
      if (res.ok) {
        setAddedProduct(true);
        router.refresh();
        setTimeout(() => setAddedProduct(false), 1600);
      }
    } finally {
      setAddingProduct(false);
    }
  };

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
          storeName: storeNameLabel,
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

  const onDragEnd = (_, info) => {
    if (info.offset.y > 120 || info.velocity.y > 800) {
      onClose();
    }
  };

  const prevImage = () => setActive((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActive((i) => (i + 1) % images.length);

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 40) prevImage();
    else if (dx < -40) nextImage();
    touchX.current = null;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="prod-backdrop"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="prod-sheet"
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
              inset-x-0 bottom-0 h-[88dvh] rounded-t-3xl border-t shadow-2xl
              lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[420px] lg:rounded-none lg:border-t-0 lg:border-l"
          >
            <div className="relative flex items-center justify-between border-b border-border-default px-4 py-3 shrink-0">
              {isMobile && (
                <div className="pointer-events-none absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-border-default" />
              )}
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Store className="h-4 w-4 text-primary-500" />
                Product &amp; Store
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

            <div className="flex-1 overflow-y-auto">
              <div
                className="relative aspect-square w-full overflow-hidden bg-bg-muted"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <div
                  className="flex h-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${active * 100}%)` }}
                >
                  {images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img}
                      alt={product.name}
                      draggable={false}
                      className="h-full w-full shrink-0 object-cover"
                    />
                  ))}
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-bg-surface/85 p-1.5 text-text-secondary shadow-lg backdrop-blur-sm transition hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-bg-surface/85 p-1.5 text-text-secondary shadow-lg backdrop-blur-sm transition hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                      {images.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === active ? "w-3.5 bg-primary-500" : "w-1.5 bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {discounted && (
                  <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-danger to-rose-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md shadow-danger/30">
                    {pctOff}% OFF
                  </span>
                )}
              </div>

              <div className="grid gap-4 p-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold leading-snug text-text-primary">
                      {product.name}
                    </h2>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-bg-muted px-2 py-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-text-primary">
                        {Number(product.ratingAvg || 0).toFixed(1)}
                      </span>
                      {product.ratingCount > 0 && (
                        <span className="text-[10px] text-text-muted">({product.ratingCount})</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                    <Store className="h-3.5 w-3.5" />
                    {storeNameLabel || "Local store"}
                  </div>

                  <div className="mt-3 flex items-center gap-2.5">
                    <p className="text-2xl font-bold text-text-primary">${finalPrice.toFixed(2)}</p>
                    {discounted && (
                      <p className="text-sm text-text-muted line-through">${price.toFixed(2)}</p>
                    )}
                    {outOfStock ? (
                      <span className="ml-auto rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                        Out of stock
                      </span>
                    ) : lowStock ? (
                      <span className="ml-auto rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500">
                        Only {quantity} left
                      </span>
                    ) : (
                      <span className="ml-auto flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" /> In stock
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-bg-muted/60 px-3.5 py-2.5 text-xs text-text-secondary">
                    <Truck className="h-4 w-4 text-primary-400" />
                    {product.deliveryEtaMinutes
                      ? `Delivered in ~${product.deliveryEtaMinutes} min`
                      : "Delivery available"}
                    {product.deliveryFee > 0 ? (
                      <span className="ml-auto font-medium text-text-primary">
                        ${product.deliveryFee.toFixed(2)}
                        {product.freeDeliveryAbove > 0 && (
                          <span className="text-text-muted">
                            {" "}· free above ${product.freeDeliveryAbove.toFixed(2)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="ml-auto font-medium text-success">Free delivery</span>
                    )}
                  </div>
                </div>

                {product.description && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Description
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {product.description}
                    </p>
                  </div>
                )}

                {services.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                      <Wrench className="h-3.5 w-3.5" /> Services ({services.length})
                    </p>
                    <div className="mt-2 grid gap-2.5">
                      {services.map((s) => {
                        const busy = addingId === s.serviceId;
                        const added = addedId === s.serviceId;
                        return (
                          <div
                            key={s.serviceId}
                            className="rounded-2xl border border-border-default p-3.5"
                          >
                            <div className="flex items-center gap-3">
                              {s.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={s.image}
                                  alt={s.name}
                                  className="h-11 w-11 shrink-0 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
                                  <Wrench className="h-5 w-5" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-text-primary">{s.name}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                                  <span className="flex items-center gap-1 font-medium text-text-primary">
                                    <DollarSign className="h-3 w-3" /> ${(s.charges || 0).toFixed(2)}
                                    {s.chargeType === "hourly" && (
                                      <span className="text-text-muted">/hr</span>
                                    )}
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
                              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                                {s.description}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => addWithService(s)}
                              disabled={busy || Boolean(addedId)}
                              className={`mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
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
                  </div>
                )}

                <div className="rounded-2xl border border-border-default bg-bg-muted/40 p-4">
                  <div className="flex items-center gap-3">
                    {product.storeLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.storeLogo}
                        alt={storeNameLabel}
                        className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
                        <Store className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {storeNameLabel || "Store"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {product.storeCategory || "General store"}
                      </p>
                    </div>
                  </div>
                  {product.storeDescription && (
                    <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">
                      {product.storeDescription}
                    </p>
                  )}
                  {(address.street || address.city || address.state || address.country) && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-xs text-text-muted">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {[address.street, address.city, address.state, address.zipCode, address.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border-default p-4">
              <button
                type="button"
                onClick={addProductToCart}
                disabled={addingProduct || outOfStock || addedProduct}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.99] ${
                  addedProduct
                    ? "bg-success/15 text-success"
                    : outOfStock
                      ? "cursor-not-allowed bg-bg-muted text-text-muted"
                      : "bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
                }`}
              >
                {addedProduct ? (
                  <>
                    <Check className="h-4 w-4" /> Added to cart
                  </>
                ) : outOfStock ? (
                  "Out of stock"
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add to cart · ${finalPrice.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
