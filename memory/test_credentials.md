# Test Credentials — Shroom & Veggies (now CLOUD-SYNCED)

Architecture: Vite + React 19 + TS frontend (served on :3000 via supervisor `frontend`) + **FastAPI + MongoDB backend** (`/app/backend/server.py`, supervisor `backend` on :8001). Frontend calls the backend at the **relative `/api`** path (same preview origin via ingress). Auth is **JWT Bearer** stored in `localStorage` (`sv_auth_token`, `sv_auth_role`).

## Seller (email + password) — SEEDED
- Email: `ramesh.patel@shroomvalley.org`
- Password: `Seller123`
- New sellers can self-register (creates a real account + logs in).

## Customer (mobile OTP)
- Phone: any (e.g. `+91 98450 12345`)
- OTP: `POST /api/auth/customer/send-otp` returns the code (SMS simulated); the UI auto-prefills it. Master OTP `123456` also works.

## Delivery Partner (Rider ID + password)
- Seeded rider: `RIDER-001` / `Rider123` (tied to the demo seller).
- Sellers create their own riders in Seller → "Delivery Riders"; a new `RIDER-XXXX` id + the chosen password are shown once.

## Backend endpoints (prefix /api)
- Auth: /auth/seller/register, /auth/seller/login, /auth/customer/send-otp, /auth/customer/verify-otp, /auth/rider/login, /auth/me
- Sellers: GET /sellers
- Products: GET /products[?sellerId], POST/PUT/DELETE /products (seller Bearer)
- Orders: GET /orders (role-based), POST /orders (customer), PUT /orders/{id}, POST /orders/{id}/location (rider)
- Riders: GET/POST /riders (seller), DELETE /riders/{id}

## Key data-testids
- guest-delivery-login-btn, auth-role-delivery, delivery-id-input, delivery-password-input, delivery-login-submit
- open-location-picker, open-location-picker-top
- nav-seller-riders, add-rider-btn, rider-name-input, rider-password-input, save-rider-btn, rider-credentials, rider-card-{agentId}
- shop-filter, shop-pill-{name}
- nav-delivery-active, nav-delivery-jobs, nav-delivery-history, accept-job-{id}, pickup-{id}, arrived-{id}, verify-{id}, share-location-{id}, delivery-otp-input, confirm-delivery-btn
- customer-delivery-otp, live-rider-map, delivery-handover-card
