# B2C Store — Features & Work Done

Summary of everything built, fixed, and reworked in this project so far.

## Tech Stack

- **Next.js 16.2.12** (App Router, Turbopack) — JavaScript/JSX only
- **MongoDB + Mongoose 9.8.1**
- **Tailwind CSS v4** with custom theme tokens (`bg-bg-surface`, `text-text-primary`, `primary-500`, `success`, `danger`, etc.)
- **react-aria-components** (`Button`, `Input`, `Label`, `Switch`)
- **framer-motion** (`AnimatePresence`, spring sheets/modals)
- **lucide-react** icons
- **Cloudinary** for image uploads, **Razorpay** for payments (test mode supported)

---

## 1. Image Uploads — Cloudinary + Atomic Upload-at-Save

**Problem fixed:** uploads reached Cloudinary but the saved image URL was lost because it lived only in React state and could be wiped by refresh/navigation.

- New upload pipeline in `app/lib/upload.js`:
  - `compressImage(file, maxSide=1600, quality=0.82)` — client-side compression (JPEG), passes through files under 1MB
  - `uploadFile(dataUrl, folder)` — uploads to Cloudinary (`b2c-store/{products|services|...}`)
- **Atomic flow everywhere** (services page, store page, products create/edit, profile settings):
  1. User picks a photo → local object-URL preview immediately
  2. On Save → compress → upload → include the returned URL in the same DB request
- Removed old 5MB/8MB client size caps (server enforces 10MB)
- Product edit page: pending files shown with dashed border until saved

**Verified:** real 0.6MB PNG upload → 200 OK; 16MB body → server rejects (10MB cap); saved image persists and returns from the API.

---

## 2. Seller Services Management

- New `/dashboard/services` page — all services across the seller's stores:
  - Edit name/charges (fixed or hourly)/duration/description/photo
  - See which products each service is linked to
- `ServiceIcon` component — auto icon per service category
- `/api/services/[serviceId]/linked-products` API
- Services are now created via modal on the store dashboard and linked/unlinked per product (max 7 per product)

---

## 3. Dynamic Delivery ETA (Distance-Based)

`app/lib/geo.js`:

- `haversineKm(store, userLoc)` — distance between store and customer
- `deliveryEtaMinutes(store, userLoc)` — **15 min base + 2 min per km**, falls back to legacy `store.deliveryMinutes || 20`
- `formatEta(minutes)` — "35 min" / "1h 15m"

**Where it shows:**

- Shop products API returns `deliveryEtaMinutes`; cart, checkout, product detail, store pages display it
- Stores API returns `etaMinutes`
- Seller no longer sets delivery minutes — only delivery fee + free-delivery-above

**Locations:**

- Store owners pin their store location (geolocation button or manual lat/lng) in the Edit Store modal
- Customers capture their location at checkout (geolocation + manual fallback), saved to profile via `/api/users`

---

## 4. Product & Order Analytics (Automatic)

Tracked on the `Product` model: `views`, `cartAdds`, `cartRemoves`, `cartDwellMinutes`, `cartDwellCount`, `unitsSold`, `orderCount`, `revenue`, `lastOrderAt`.

- **Views** — POST `/api/products/[id]` `{action:"view"}` (fired when the shop product sheet opens)
- **Cart adds** — POST `/api/cart`
- **Cart removes / dwell time** — DELETE `/api/cart` (dwell computed from `addedAt` on the cart item)
- **Sales stats** — updated when an order is created (per product, including dwell from cart), and **reverted** when an order is cancelled

**Seller dashboard** (`/dashboard/products`):

- Store chips with the first store auto-selected
- Accordion product rows: thumbnails, low-stock badge, and a full analytics grid — views, cart adds/removes, avg dwell, units sold, orders, revenue, conversion %, rack time, last order
- Performance verdict: "Selling well" / "Slow mover" / "No sales yet"

---

## 5. Order Lifecycle & Confirmed Delivery

Status flow: `pending → confirmed (paid) → shipped → delivered / cancelled`

- Order is `confirmed` when Razorpay verification passes (`confirmedAt` set per item)
- Sellers mark items shipped; **customer taps "Confirm received"** to flip to `delivered` — this triggers `processDeliveredPayouts` + settlement updates + notifications
- Cancelling reverts product stats exactly once (guard against double-revert)
- Timeline component upgraded to 4 steps: **Placed → Confirmed → Shipped → Delivered**

---

## 6. Seller Dashboard Improvements

- **Store page** (`/dashboard/store`):
  - Edit Store modal — name, contact, category, description, address, geolocation detect, manual lat/lng
  - Add/Edit Service modal (with photo preview), edit (pencil) + delete buttons on service rows
  - Delivery minutes field removed; explanatory note shown
- **Product details form** (`/dashboard/products/[id]`):
  - Live/sold-out/low-stock badges, stock progress bar
  - Field-level validation (required name/price/qty, discount < price)
  - Live discount summary ("Sells at $X · Y% off"), char counter, product ID copy, dirty-state save button ("Saved" until changed)

---

## 7. Customer Shop Experience (Shop-Only Flow)

**The shop page (`/shop`) is now the single customer browsing surface.**

- `/products`, `/products/[id]`, `/stores`, `/stores/[id]` pages and the old `PublicHeader` were **removed**
- Product cards restyled to match the theme: gradient badges (Service / % OFF), rating pill, store name, description snippet, delivery ETA, stock indicator, sold-out state
- **Clicking a card opens the Product & Store sheet** (`ProductSheet`):
  - Desktop: right-side drawer (420px) with backdrop
  - Mobile: bottom sheet with drag handle — **drag down or tap X to close**
  - Contains: image carousel, rating, price/discount, stock, delivery ETA + fee, description, all services (each with "Add product with this service"), store card (logo, category, description, address), sticky Add-to-cart
- Shop API enriches products with `serviceDetails`, `storeAddress`, `storeDescription`, `storeLogo`, `freeDeliveryAbove`
- Category chips removed — search + sort only

---

## 8. Misc

- **Custom 404 page** (`app/not-found.jsx`) matching the dark theme, with Back to Home / Browse the Shop CTAs
- **Homepage navbar** updated — only Shop link + "Start Selling" CTA
- `public/placeholder.svg` created (was referenced but missing → broken card images)
- Cart, checkout, and dashboard flows untouched in the shop rework

---

## Git Status

- `85c7a58` — "integrate cloudinary for profile, product and service photos"
- `f00cc11` — "add services management page, category icons and atomic photo uploads"
- Everything after `f00cc11` (sections 3–8) is **uncommitted** and pending review/commit
