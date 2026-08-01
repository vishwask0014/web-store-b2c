# B2C Store — Data Architecture

> How data is stored today (MongoDB/Mongoose). Read this before changing the persistence structure.

## Stack at a Glance

| Layer | Tech |
|---|---|
| App | Next.js 16 (App Router), React 19, JavaScript |
| Database | MongoDB Atlas, Mongoose 9, DB `b2c-store` |
| Auth | Firebase Auth (client) + signed jose JWT cookie (server) |
| Payments | Razorpay checkout + RazorpayX payouts (best-effort) |

---

## Big Picture

```
Firebase Auth ──> users ──> carts (1 per user)
                   │
                   ├── owner ──> stores (max 2/user, unique category)
                   │                 └── products ──> services (shared collection)
                   │                 └── services
                   │
                   └── buyer ──> orders (snapshot of items, may span stores)
                                     └── settlements (per seller, inside order doc)

notifications ──> per user, created from server events
```

**IDs:** public keys are random 8-hex uppercase strings (`crypto.randomBytes(4)`), **not** Mongo `_id`:
`users.uid` (Firebase), `stores.uniqueStoreId`, `products.uniqueProductId`, `orders.orderId`.
Cross-collection references are plain strings.

---

## Collections

### `users` — buyers + sellers in one doc

| Field | Notes |
|---|---|
| `uid` | Firebase UID, unique, primary key |
| `name`, `email`, `phone`, `role` | role: customer / seller / operator / admin |
| `location` | `{address, city, state, zip, country}` |
| `paymentMethods[]` | saved cards/UPI: `{type, upiId, brand, last4, holderName, expiry}` (plaintext) |
| `defaultPaymentMethod`, `autoPay` | fast checkout |
| `payout` | **seller receive-only**: `{type: bank\|upi, accountHolder, accountNumber, ifsc, bankName, upiId}` |
| `razorpayContactId`, `razorpayFundAccountId` | cached RazorpayX ids for payouts |

### `stores` — the shop

| Field | Notes |
|---|---|
| `uniqueStoreId` | unique, referenced by products/orders |
| `name`, `phoneNumber`, `email`, `category`, `description` | |
| `logo`, `banner` | URL strings — **never populated, no upload code exists** |
| `address` | `{street, city, state, zipCode, country}` |
| `ownerId` | → `users.uid` |
| `serviceLimit` | default 10, **unused/dead config** |
| `disabled`, `disabledReason`, `isActive` | disabled stores can never be re-enabled |

Unique index `{ownerId, category}` — one category per owner.

### `products`

| Field | Notes |
|---|---|
| `uniqueProductId` | unique, referenced by carts/orders |
| `storeId` | → `stores.uniqueStoreId` |
| `name`, `category`, `brand`, `description` | |
| `price`, `discountPrice`, `currency` | currency default USD |
| `quantity` (stock), `minOrderQuantity`, `unit` | stock clamped at checkout |
| `images[]`, `tags[]` | images are empty URL strings |
| `isServiceAvailable` | |
| `services[]` | **denormalized snapshot** of services: `{serviceId, name, charges}` max 7 |

### `services` — global definitions, referenced by products

`name`, `charges`, `chargeType` (fixed/hourly), `durationMinutes`, `description`,
`productId` (empty = store-level), `storeId`, `isActive`, `isRecurring`.

Max 7 per store, 7 per product. **Two sources of truth** (global doc + product snapshot).

### `orders` — one checkout, many stores

| Field | Notes |
|---|---|
| `orderId` | unique |
| `userId`, `customer*` | buyer snapshot |
| `items[]` | **snapshot**: `{storeId, storeName, productId, name, price, quantity, serviceId, serviceName, serviceCharge}` |
| `subtotal`, `serviceTotal`, `total`, `currency` | |
| `deliveryLocation` | snapshot |
| `paymentMethod` | snapshot: card / upi / razorpay |
| `paid`, `razorpayOrderId`, `razorpayPaymentId` | payment state |
| `settlements[]` | per-seller: `{ownerId, storeIds, amount, fee, share, status, payoutId, paidAt, note}` |
| `status` | pending → confirmed → shipped → delivered (or cancelled) |

**Settlement math** (`app/lib/razorpay.js`): seller `share = 94%`, platform `fee = 6%` of their line totals.

### `carts` — 1 per user

`userId` (unique) + `items[]` mirroring order items (snapshot). Cleared after checkout.

### `notifications`

`{userId, type, title, message, link, read}` — written by `createNotification()` (`app/lib/notify.js`), read via Zustand store.

---

## Key Rules

- Max 2 stores per user; unique category per owner
- Max 7 services per store / per product; disabled stores never re-enable
- Checkout totals always recomputed server-side from cart + DB (no client-trusted amounts)
- Delivery of an order triggers payouts; payout failures **never block** the order update
- `users` docs are auto-created by `/api/auth/session` on first login — there is no sign-up API

---

## API Surface

| Area | Routes |
|---|---|
| Users | `/api/users` GET/POST/PUT — profile, payment methods, payout settings |
| Stores | `/api/stores` GET/POST; `/api/stores/[id]` GET/PUT/DELETE |
| Products | `/api/stores/[id]/products` GET/POST; `.../[productId]` GET/PUT/DELETE |
| Services | `/api/stores/[id]/services`; `.../products/[pid]/services`; `/api/services/[id]` PUT/DELETE |
| Orders | `/api/orders` GET/POST; `/api/orders/[orderId]` GET/PUT (status → payout on delivered) |
| Cart | `/api/cart` GET/POST |
| Payments | `/api/payments/order` POST; `/api/payments/verify` POST |
| Notifications | `/api/notifications`; `/api/notifications/[id]`; `/api/notifications/read-all` |
| Auth | `/api/auth/session`, `/api/auth/me`, `/api/auth/logout` |

---

## Data Flows (short)

**Checkout → paid order**
`/api/payments/order` (recompute totals, create Razorpay order) → popup (test/live) →
`/api/payments/verify` → `/api/orders` (snapshot items, compute settlements, clear cart).
Test mode (`pay_test_*` ids) bypasses Razorpay.

**Delivery → payout**
`PUT /api/orders/[id]` with `delivered` → `processDeliveredPayouts()`: ensure RazorpayX contact +
fund account (cached on `users`) → payout 94%. Settlement → `initiated` / `blocked` / `failed`.

---

## Env (`/.env`)

`NEXT_PUBLIC_FIREBASE_*` · `MONGODB_URI` · `JWT_SECRET` · `SESSION_DURATION_SECONDS` ·
`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` ·
`NEXT_PUBLIC_PAYMENT_MODE` (test/live) · `RAZORPAY_CURRENCY` · `RAZORPAYX_ACCOUNT_NUMBER`

---

## Restructure Candidates

- **String refs, no integrity** — no ObjectIds, orphan risk; orders keep snapshots intentionally
- **Snapshots everywhere** (cart/order items, product services) — reads are simple, no `$lookup`
- **Buyer + seller data in one `users` doc** — consider a `seller_profiles` collection
- **Services: two sources of truth** — charge changes don't propagate to existing carts
- **Settlements embedded in orders** — payout history isn't independently queryable; consider a
  separate `settlements` collection for reports/retries
- **Plaintext payment/payout details** — consider encryption/tokenization
- **`disabled` + `isActive` overlap** on stores
- **Currency mismatch** — orders in USD, Razorpay orders/payouts in INR
- **Dead config** — `stores.serviceLimit` (10) never enforced; real cap is 7
- **No media storage** — `logo`/`banner`/`images` never populated; no upload code
- **No seed/migration tooling** — schema changes must be manual
