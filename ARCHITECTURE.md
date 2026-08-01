# B2C Store — Data Architecture

This document describes **how data is currently stored** (MongoDB via Mongoose) so you can plan
structural changes to the persistence layer.

## Stack

| Layer    | Technology |
| -------- | ---------- |
| App      | Next.js 16 (App Router, Turbopack), React 19, JavaScript |
| Database | MongoDB Atlas (Mongoose 9, DB name `b2c-store`) |
| Auth     | Firebase Auth (client) + signed session cookie (jose JWT, server) |
| Payments | Razorpay (checkout) + RazorpayX (payouts, best-effort) |
| State    | Zustand (client-side cart, auth, notifications) |

## Collections & Models

All models live in `app/models/*.js`. Each document is created with an auto `_id` (Mongo ObjectId)
plus `createdAt` / `updatedAt` timestamps.

### 1. `users` — `app/models/User.js`

The user profile. Also the **customer** (buyer) and **seller** (shop owner) record.

| Field | Type | Notes |
| ----- | ---- | ----- |
| `uid` | String | Firebase UID, **unique** — primary business key |
| `name` | String | required |
| `email` | String | unique when non-empty (partial index) |
| `role` | String | `customer` \| `seller` \| `operator` \| `admin` |
| `phone` | String | unique when non-empty |
| `location` | Subdoc | `{ address, city, state, zip, country }` |
| `paymentMethods[]` | Subdoc array | `{ type: card\|upi, upiId, brand, last4, holderName, expiry }` (customer saved methods) |
| `defaultPaymentMethod` | String | `_id` of the default saved method |
| `autoPay` | Boolean | Use default method automatically |
| `payout` | Subdoc | **seller receive-only**: `{ type: bank\|upi, accountHolder, accountNumber, ifsc, bankName, upiId }` |
| `razorpayContactId` | String | Cached RazorpayX contact id (payouts) |
| `razorpayFundAccountId` | String | Cached RazorpayX fund account id (payouts) |

> Note: payment methods and payout details are stored **in plaintext** (only display-masked client-side).
> Cards are stored as brand + last4 + expiry; full PAN is never persisted.

### 2. `stores` — `app/models/Store.js`

A seller's shop. Max **2 stores per user**, each in a **unique category** (enforced in `POST /api/stores`).

| Field | Type | Notes |
| ----- | ---- | ----- |
| `uniqueStoreId` | String | Random 8-hex uppercase (e.g. `A1B2C3D4`), **unique** — referenced by products/orders |
| `name` | String | required |
| `phoneNumber` | String | required |
| `email` | String | |
| `category` | String | required |
| `description`, `logo`, `banner` | String | |
| `address` | Subdoc | `{ street, city, state, zipCode, country }` |
| `ownerId` | String | references `users.uid` (indexed) |
| `serviceLimit` | Number | default 10 |
| `disabled` / `disabledReason` | Boolean / String | disabled stores are **never re-enabled** (per current business rule) |
| `isActive` | Boolean | |

Unique index: `{ ownerId: 1, category: 1 }`.

### 3. `products` — `app/models/Product.js`

| Field | Type | Notes |
| ----- | ---- | ----- |
| `uniqueProductId` | String | Random 8-hex uppercase, **unique** — referenced by cart/orders |
| `storeId` | String | references `stores.uniqueStoreId` (indexed) |
| `name`, `category`, `brand`, `description` | String | |
| `price` | Number | min 0 |
| `discountPrice` | Number | nullable |
| `currency` | String | default `USD` |
| `quantity` | Number | stock (clamped at checkout) |
| `minOrderQuantity`, `unit` | Number / String | |
| `images[]`, `tags[]` | Arrays | |
| `isServiceAvailable` | Boolean | |
| `services[]` | Subdoc array | **denormalized snapshot**: `{ serviceId, name, charges }` — max 7 (validator) |
| `isActive` | Boolean | |

Unique index: `{ storeId: 1, name: 1 }`.

### 4. `services` — `app/models/Service.js`

Global service definitions **referenced by** products.

| Field | Type | Notes |
| ----- | ---- | ----- |
| `name` | String | required |
| `charges` | Number | required |
| `chargeType` | String | `fixed` \| `hourly` |
| `durationMinutes` | Number | default 60 |
| `description` | String | |
| `productId` | String | links to `products.uniqueProductId` (empty = store-level service) |
| `storeId` | String | required |
| `isActive` | Boolean | |
| `isRecurring` | Boolean | |

Unique index: `{ storeId: 1, name: 1 }`. Max **7 services per store** and **7 per product** (business rule).

### 5. `orders` — `app/models/Order.js`

One order = one customer checkout, may span **multiple stores**. Items are **denormalized snapshots**
(captures name/price at purchase time — resilient to product edits).

| Field | Type | Notes |
| ----- | ---- | ----- |
| `orderId` | String | Random 8-hex uppercase, **unique** |
| `userId` | String | buyer `users.uid` (indexed) |
| `customerName/Email/Phone` | String | snapshot of buyer |
| `items[]` | Subdoc array | `{ storeId, storeName, productId, name, price, quantity, serviceId, serviceName, serviceCharge }` |
| `subtotal`, `serviceTotal`, `total` | Number | |
| `currency` | String | `USD` |
| `deliveryLocation` | Subdoc | buyer address snapshot |
| `paymentMethod` | Subdoc | `{ type: card\|upi\|razorpay, upiId, brand, last4, holderName, expiry }` snapshot |
| `paid` | Boolean | true when Razorpay payment verified (incl. test-mode simulation) |
| `razorpayOrderId`, `razorpayPaymentId` | String | payment references |
| `settlements[]` | Subdoc array | per-seller: `{ ownerId, storeIds[], amount, fee, share, status, payoutId, paidAt, note }` — computed at order creation |
| `autoPaid` | Boolean | |
| `status` | String | `pending` \| `confirmed` \| `shipped` \| `delivered` \| `cancelled` |

Indexes: `{ userId: 1, createdAt: -1 }`, `{ "items.storeId": 1 }`.

**Settlement math:** at creation, each seller's line totals are summed →
`share = amount × 94%`, `fee = amount × 6%` (`PLATFORM_FEE_PERCENT` in `app/lib/razorpay.js`).

### 6. `carts` — `app/models/Cart.js`

One cart per user (`userId` unique). `items[]` mirrors order items (denormalized snapshot of the
product at add-to-cart time). Cleared after checkout.

### 7. `notifications` — `app/models/Notification.js`

Per-user in-app notifications. `{ userId, type, title, message, link, read }` with
`{ userId, createdAt: -1 }` and `{ userId, read }` indexes.

## Identity Strategy (important)

- Business entities do **not** expose Mongo `_id` to the app.
- Public keys: `users.uid` (Firebase), `stores.uniqueStoreId`, `products.uniqueProductId`,
  `orders.orderId` — all random 8-hex uppercase strings, generated with `crypto.randomBytes(4)`.
- Cross-collection references are **plain strings** (not `ObjectId` / `Schema.Types.ObjectId`), e.g.
  `product.storeId → store.uniqueStoreId`.
- Saved payment methods use their Mongo `_id` string as the selection key.

## API Surface (`app/api/*`)

| Route | Methods | Purpose |
| ----- | ------- | ------- |
| `/api/users` | GET, POST, PUT | profile read/update; add/remove card & UPI; set default; autoPay; **payout details** |
| `/api/stores` | GET, POST | list (by `ownerId`) / create (2-store + unique-category rules) |
| `/api/stores/[storeId]` | GET, PUT, DELETE | store detail / update / disable |
| `/api/stores/[storeId]/products` | GET, POST | list / create products |
| `/api/stores/[storeId]/products/[productId]` | GET, PUT, DELETE | product detail / update / delete |
| `/api/stores/[storeId]/products/[productId]/services` | GET, POST | product-level services |
| `/api/stores/[storeId]/services` | GET, POST | store-level services |
| `/api/services/[serviceId]` | PUT, DELETE | service update / delete |
| `/api/orders` | GET, POST | list (admin/all, seller, buyer) / create (cart → order, settlements) |
| `/api/orders/[orderId]` | GET, PUT | detail / status update (**delivery triggers payouts**) |
| `/api/cart` | GET, POST | cart read / sync |
| `/api/notifications`, `/api/notifications/[id]`, `/api/notifications/read-all` | GET, PUT | notifications |
| `/api/payments/order` | POST | server-side cart total → Razorpay order |
| `/api/payments/verify` | POST | verify Razorpay payment server-side |
| `/api/auth/session`, `/api/auth/me`, `/api/auth/logout` | — | session cookie / identity |

## Key Data Flows

### User provisioning (no sign-up API)

There is **no client-side user registration endpoint**. A `users` document is auto-created
server-side on first session by `POST /api/auth/session` (`app/api/auth/session/route.js`) from the
Firebase identity (uid/name/email/phone). Admin-created users use `POST /api/users` (admin-only).
This means the `users` collection is always in sync with Firebase sign-ups by construction.

### Notifications

Created server-side via the `createNotification()` helper (`app/lib/notify.js`) from business events
(new order, status change, store disabled); read client-side from `app/stores/notificationStore.js`
(Zustand) via `/api/notifications`.

### Media / file storage

**No binary storage is implemented today.** Firebase `storageBucket` is configured in
`app/lib/firebase.js`, but no upload code exists (`uploadBytes`/`getDownloadURL` are never used).
`stores.logo`, `stores.banner` and `products.images` are plain URL strings that are never populated —
there is no image upload path anywhere in the app yet.

### Checkout → Paid Order (customer)

1. `POST /api/payments/order` — recomputes totals **from cart + DB products** (no client-trusted amounts), creates Razorpay order.
2. Checkout popup (test or live, `NEXT_PUBLIC_PAYMENT_MODE`).
3. `POST /api/payments/verify` — fetches payment from Razorpay, checks `order_id`, amount, status.
4. `POST /api/orders` — re-verifies server-side, snapshots items, computes `settlements[]`, clears cart.
   Test mode accepts `pay_test_*` ids without a Razorpay call.

### Delivery → Payout (seller)

1. `PUT /api/orders/[orderId]` with `status: "delivered"`.
2. `processDeliveredPayouts()` (`app/lib/razorpay.js`): for each settlement —
   ensure RazorpayX contact & fund account (cached on `users`), create payout of `share` (94%).
3. Settlement `status` updated: `initiated` (payout id), `blocked` (no payout details / RazorpayX not
   configured), or `failed`. Order update is **never blocked** by payout errors.

## Auth / Session

- Client: Firebase Auth (email/password, Google, phone OTP).
- Server: `app/lib/auth.js` — jose JWT in a signed httpOnly cookie, or Firebase service-account
  verification when `FIREBASE_SERVICE_ACCOUNT` is set (jose fallback active today).
- Role checks: `app/lib/roles.js` (`seller`, `operator`, `admin` are seller roles).

## Environment Variables (`/.env`)

```
NEXT_PUBLIC_FIREBASE_*      Firebase web config
MONGODB_URI                 Atlas connection string (db: b2c-store)
JWT_SECRET                  cookie signing
SESSION_DURATION_SECONDS    session lifetime
RAZORPAY_KEY_ID             server Razorpay key
RAZORPAY_KEY_SECRET         server Razorpay secret
NEXT_PUBLIC_RAZORPAY_KEY_ID client checkout key
NEXT_PUBLIC_PAYMENT_MODE    test | live (test = simulated payments)
RAZORPAY_CURRENCY           INR default
RAZORPAYX_ACCOUNT_NUMBER    payout account (empty until RazorpayX enabled)
```

## Known Design Notes / Restructure Candidates

- **String references instead of ObjectIds** — no referential integrity; orphan risk
  (e.g., deleted store's products remain in carts/orders by design, orders keep snapshots intentionally).
- **Denormalized snapshots everywhere** (cart items, order items, product services) — trade
  consistency for read simplicity; no `$lookup` aggregation is used by the app.
- **`users` document holds both buyer and seller data** (payment methods + payout) — consider splitting
  seller settings into a `seller_profiles` collection or keeping per-role subdocs.
- **`services` is a global collection** while products also embed a services snapshot — two sources of
  truth for charges; changing a service's charges doesn't propagate to existing carts.
- **Settlements live inside the order doc** — payout history is not queryable independently; consider a
  separate `settlements` collection if you need payout reports / retries.
- **Payment method / payout details stored plaintext** — consider encryption at rest or tokenization.
- **Two store "state" flags** (`disabled` + `isActive`) — semantics overlap.
- **Currency mismatch**: order totals are displayed/calculated in `USD` but Razorpay orders use
  `RAZORPAY_CURRENCY` (default `INR`, ×100 paise) and payouts use `INR` — an amount in the DB is not
  directly comparable to a Razorpay amount without conversion.
- **Store service limit inconsistency**: `stores.serviceLimit` defaults to 10 and nothing enforces it,
  while the product-embedded `services` array is capped at 7 and store-level services are capped at 7
  in the API. The `serviceLimit` field is effectively dead config.
- **No media storage**: `logo`/`banner`/`images` fields are URL strings with no upload path — adding
  Firebase Storage or a CDN is required before media-dependent UI can be completed.
- **No seed/migration tooling**: schema changes must be applied manually or via a migration script;
  there is no `mongodb-migrate` or seed script in the repo.
