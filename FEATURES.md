# B2C Store — Feature Documentation

A B2C multi-vendor marketplace: sellers create stores and list products with optional services; customers browse products, build a cart, and place orders.

**Stack:** Next.js 16 (App Router) · React · MongoDB/Mongoose · Firebase Auth · Zustand · Tailwind (dark theme)

---

## 1. Roles & Access Control

Four roles, stored on the Mongo `User` record (`app/models/User.js`):

| Role | Capabilities |
|------|--------------|
| `customer` | Shop, cart, checkout, orders, profile (cards, location). **Cannot** create stores/products/services. |
| `seller` | Create up to 2 stores, products, services; manage orders on their stores. |
| `operator` | Same store-management rights as seller. |
| `admin` | Everything above + admin pages (Users, Settings). |

**Enforcement:**
- Backend: `app/lib/roles.js` — `getSellerUser()`/`sellerDenied()`; store/product/service creation APIs return `403` for non-sellers.
- Frontend: `DashboardLayout` redirects customers to `/shop`; sidebar shows Shop/Cart for customers, Store/Products/Orders for sellers.
- Admins assign roles from **Admin → Users** (role dropdown → `PUT /api/users`).

## 2. Authentication

- Firebase email/password (`app/lib/firebase.js`), Zustand store `app/stores/authStore.js`:
  - `onAuthStateChanged` → fetch user from Mongo (`GET /api/users?uid=`) → auto-create as `customer` if missing.
  - `useAuth()` hook exposes `{ user, userType, loading }`.
- Pages: `/auth` (login/signup/forgot-password tabs).
- `ProtectedRoute` wraps dashboard/shop layouts.

## 3. MongoDB Models (`app/models/`)

| Model | Key fields |
|-------|-----------|
| `User` | uid, name, email, role, phone, location (address/city/state/zip/country), paymentMethods[] (brand, last4, holderName, expiry), defaultPaymentMethod, autoPay |
| `Store` | uniqueStoreId, name, email, phoneNumber, category, description, logo, banner, address, ownerId, serviceLimit, disabled + disabledReason, isActive; unique index `(ownerId, category)` |
| `Product` | uniqueProductId, storeId, name, category, brand, description, price, discountPrice, currency, quantity, minOrderQuantity, unit, images[], tags[], isServiceAvailable, **services[]** (linked services snapshot: serviceId/name/charges, max 7), isActive; unique index `(storeId, name)` |
| `Service` | store-level pool: name, charges, chargeType (fixed/hourly), durationMinutes, description, storeId, isActive, isRecurring; max 7 per store; unique index `(storeId, name)` |
| `Cart` | one per user: items[] (storeId, storeName, productId, name, price, quantity, optional serviceId/serviceName/serviceCharge) |
| `Order` | orderId, userId, customer info, items[] (snapshot incl. service), subtotal, serviceTotal, total, currency, deliveryLocation, paymentMethod (masked card), autoPaid, status (pending → confirmed → shipped → delivered / cancelled) |

DB name is forced to `b2c-store` in `app/lib/mongodb.js` (never `test`). Set `MONGODB_URI` in `.env` to connect.

## 4. API Routes (`app/api/`)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/users` | GET, POST, PUT | Fetch by uid/email/list; create/auto-create; update profile, location, addCard/removeCard, defaultPaymentMethod, autoPay |
| `/stores` | GET, POST | List (by ownerId or all); create (2-store limit, unique category, seller-only) |
| `/stores/[storeId]` | GET, PUT, DELETE | Store detail/update/delete; disabled stores can't be re-enabled |
| `/stores/[storeId]/products` | GET, POST | Product list/create (duplicate-name detection across owner's stores → store disabled) |
| `/stores/[storeId]/products/[productId]` | GET, PUT, DELETE | Product detail/update (incl. linking services)/delete |
| `/stores/[storeId]/services` | GET, POST | Store service pool (max 7, duplicate check) |
| `/stores/[storeId]/products/[productId]/services` | GET, POST | Legacy per-product services (backward compatible) |
| `/services/[serviceId]` | GET, PUT, DELETE | Service detail/update/delete |
| `/cart` | GET, POST, PUT, DELETE | Fetch cart; add/update item (validates product + linked service, clamps to stock); remove item |
| `/orders` | GET, POST | List by `userId` or `sellerId`; create from cart (re-validates stock, snapshots prices, requires a card, clears cart) |
| `/orders/[orderId]` | GET, PUT | Detail; status update (seller must own items in the order) |

> **Important:** Next.js 16 makes route-handler `params` a Promise — every dynamic route awaits `params` (`const { storeId } = await params`).

## 5. Pages / Routes

| Route | Audience | Description |
|-------|----------|-------------|
| `/` | Public | Marketing landing page (hero, stats, features, categories) |
| `/products` | Public | Paginated product listing (12/page, prev/next + page numbers) |
| `/stores` | Public | Paginated store listing; **All Stores** + **Near You** tabs (matches profile city/zip) |
| `/auth` | Public | Sign in / sign up / forgot password |
| `/shop` | Customers | Product grid + left **Stores box** (filter by store, sticky store info panel) with Add to Cart and service selection |
| `/cart` | Customers | Cart with quantity controls, remove, totals |
| `/checkout` | Customers | Order summary, delivery location, card selection, auto-pay toggle, place order → confirmation |
| `/orders` | Customers | Order history with status, items, payment, delivery |
| `/profile-settings` | All | Edit name/phone, location; add/remove cards (CVV never stored), set default, auto-pay toggle |
| `/dashboard` | Sellers/Admins | Live stats (products, stores, orders) with links |
| `/dashboard/store` | Sellers | Create stores (max 2), manage service pool (max 7) |
| `/dashboard/products` | Sellers | Product catalog; create product with service-pool multi-select |
| `/dashboard/products/[productId]` | Sellers | Link/unlink services (max 7), create-and-link |
| `/dashboard/orders` | Sellers | Orders on their stores with status dropdown |
| `/dashboard/admin/users` | Admins | User list + role assignment |
| `/dashboard/admin/settings` | Admins | Placeholder |

## 6. Key Business Rules (backend-enforced)

- Max **2 stores** per account; each store must have a **unique category**.
- **No duplicate products or services** across an owner's stores — violation disables the store (with reason).
- Max **7 services per store** pool; max **7 services linked per product**.
- Disabled stores cannot be re-enabled via API.
- Product stock is respected: cart quantities clamp to available stock; checkout fails on out-of-stock items.
- Checkout requires a saved card; order records masked card + auto-pay flag.

## 7. Branding & Theme

- **Brand:** B2C Store — reusable `Logo` component (shopping-bag mark on `#426BC2`), favicon `app/icon.svg`.
- **Dark theme** (`theme.md` → `app/globals.css`): bg-primary `#050a1f`, bg-surface `#0a1233`, bg-muted `#0d1738`, bg-elevated `#0f1a3d`, primary `#426BC2`, text-primary `#F7F4ED`, border `#27356E`.
- Shared components: `Logo`, `PublicHeader`, `ShopLayout`, `Pagination`, `Sidebar`, `Navbar`, `DashboardLayout`, `ProtectedRoute`.

## 8. Known Notes

- `.env` needs Firebase config + `MONGODB_URI` (currently placeholder/empty).
- Firestore is **not** used for user data (users live in MongoDB); a non-fatal `Database '(default)' not found` warning may appear in logs.
- Payments are **simulated**: cards are stored masked (last-4 only) and no real payment gateway is integrated.
- "Near You" on `/stores` matches the profile city/zip; true GPS distance requires geocoding store addresses.
- Restart the dev server after pulling changes (params-promise fix affects all dynamic API routes).
