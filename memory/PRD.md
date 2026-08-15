# Shroom & Veggies — Multi-Role Farm Marketplace (PRD)

## Original problem statement (paraphrased)
Single-seller mushroom shop (expandable to more products & sellers) needing a full restructure with redesigned Customer, Seller, and Delivery interfaces; proper location selection; OTP/QR delivery handover; COD confirmation. Follow-up ask: make it a real multi-seller marketplace, add a live rider map, move to a real database (cloud sync), and let sellers onboard their own riders.

## Architecture (current)
- **Frontend:** Vite + React 19 + TypeScript, served on :3000 via supervisor `frontend`. Calls backend at relative `/api` (same preview origin via ingress).
- **Backend:** FastAPI + MongoDB (Motor), supervisor `backend` on :8001. JWT **Bearer** auth (token in localStorage `sv_auth_token`). bcrypt password hashing. `/app/backend/server.py`.
- **Client cache:** `services/storage.ts` keeps only cart, active address, and pure helpers (distance/limit). All accounts/products/orders live in MongoDB.
- Location & maps: keyless (Google Maps iframe embed + OpenStreetMap/Nominatim). QR via `qrcode` npm.

## Roles
- Customer: phone OTP login (SMS simulated — send-otp returns code).
- Seller: email + password (self-register creates real account). Seeded demo: ramesh.patel@shroomvalley.org / Seller123.
- Delivery rider: Rider ID + password, created by a seller. Seeded: RIDER-001 / Rider123.

## Implemented
### Phase 1 (client-side, 2026-06)
- 3 interfaces, delivery portal with stage machine + OTP/QR handover, COD confirmation, seller→delivery publish, reachable location picker (manual + Google Maps precise pin).

### Phase 2 — Backend migration + 4 features (2026-06)
- **Cloud Sync:** full FastAPI + MongoDB backend; JWT sessions persist across reloads/devices. 23/23 backend pytest passing.
- **Multi-Seller Catalogs:** products carry sellerId/sellerName/sellerLat/lng; storefront shows all sellers with a "Shops" filter; each seller sees only their own products/orders. Cross-seller carts split into one order per seller at checkout.
- **Rider Onboarding:** Seller "Delivery Riders" tab (RiderManager) to create/list/delete riders; new RIDER-XXXX id + password shown once; rider logs in and sees that seller's jobs.
- **Live Rider Map:** rider "Share Live Location" (navigator.geolocation → POST /orders/{id}/location); customer OrderTracker shows a live Google Maps iframe (data-testid live-rider-map) that refreshes via 7s order polling.
- **Hardening:** backend normalizes product `distanceRules` and order `address`; frontend guards against partial data (no white-screen crashes).

## Verified
- Backend: 23/23 pytest (`/app/backend/tests/backend_test.py`).
- Frontend E2E: multi-seller shop filter, cross-seller cards, JWT persistence on reload, rider onboarding + new-rider login, live rider map, full delivery OTP loop, location picker. (iteration_3 report; defensive crashes fixed post-report.)

## Backlog / next
- P1: Seller-scoped analytics & payouts; seller can assign a specific rider to an order (currently riders self-accept from their seller's job pool).
- P2: Real SMS (Twilio) & real payments (go-live) — currently simulated.
- P2: WebSocket push instead of 7s polling; battery-friendly rider tracking.
- P2: Move Tailwind from CDN to PostCSS build (LOW console warning).

## Notes / MOCKED
- Payments (Razorpay) and SMS OTP are SIMULATED (send-otp returns the code). Maps are keyless embeds. Everything else is persisted in MongoDB.
