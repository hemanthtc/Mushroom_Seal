# Shroom & Veggies — Multi-Role Farm E-commerce (PRD)

## Original problem statement (paraphrased)
Single-seller mushroom e-commerce (expandable to more products & more sellers) that needs a full restructure:
- Redesigned Customer interface: catalog, cart, ordering, proper location selection.
- Seller interface: portfolio/profile, product management, order tracking (accepted/completed).
- NEW Delivery Partner interface: assigned-order tracking + OTP/QR handover verification.
- COD: customer shows a QR/OTP to confirm payment on delivery.
- Logins: mobile-number OTP for customers, email+password for sellers, delivery-ID for delivery partners.

## Architecture
- **Stack:** Vite + React 19 + TypeScript. 100% client-side; data persists in browser localStorage/sessionStorage. No backend service is used (an unused Express/Mongoose folder remains at /app/server).
- **Runtime:** App relocated to `/app/frontend`, served by Vite on port 3000 via supervisor `frontend` (`yarn start`). Preview ingress routes non-/api traffic to :3000.
- Location uses free OpenStreetMap/Nominatim geocoding + Google Maps iframe embed (no API key). QR via `qrcode` npm package.

## Roles & sessions
- Customer: phone OTP login, 7-day localStorage session.
- Seller: email+password, tab (sessionStorage) session.
- Delivery Partner: Rider ID + password, tab session. Default riders RIDER-001 (Arjun Kumar), RIDER-002 (Priya Nair).

## Implemented (2026-06)
- Relocated + configured app to run in preview (Vite :3000).
- **Delivery Partner interface** (`components/delivery/DeliveryPortal.tsx`): Available Jobs / Active / History, stat cards, stage machine Assigned→Picked Up→Arrived→Delivered, map navigation link, COD collect prompt.
- **OTP/QR handover verification:** every order gets a 6-digit `deliveryOtp` at checkout; customer sees it + a QR (encodes orderId/otp/amount/cod) on the Live Delivery Tracking card once Out for Delivery; delivery partner enters the OTP to complete (wrong OTP rejected). For COD, the same code confirms payment collected.
- **Seller→Delivery flow:** seller "Hand to Delivery (Publish Job)" publishes the order to riders; seller sees assigned rider + stage, or can self-deliver.
- **Auth:** added Delivery role tab + form to AuthModal; guest header "Delivery Partner" entry.
- **Location fix (was unreachable):** header location pill is now a button opening the DistanceSelectorModal (manual form + Zone presets + custom distance slider + Google Maps precise picker with GPS/search). Manual distance now respected (no override by stale coords). Map modal actions moved to a sticky footer.
- Fixed toast id key collision and duplicate status toasts.
- **Verified by testing agent:** full loop (seller add product → customer COD order → publish → rider accept/pickup/arrive/OTP verify → delivered) and location picker — all passing.

## Backlog / next
- P1: True multi-seller — per-seller catalogs, seller onboarding of their own riders, seller-scoped order/analytics (currently seller registration exists as pending-approval simulation; catalog is shared).
- P1: Delivery — live GPS map trail (currently status + navigate link + insulated cold-box stage tracking).
- P2: Move Tailwind off CDN to PostCSS build.
- P2: Persist data to a real backend (FastAPI/Mongo) if multi-device sync is needed.

## Notes / MOCKED
- Payments (Razorpay) and SMS OTP are SIMULATED. Geocoding is live (OSM/Google embed, keyless). All data is browser-local (no server persistence / no cross-device sync).
