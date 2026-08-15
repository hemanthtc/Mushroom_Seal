# Test Credentials — Shroom & Veggies (client-side, localStorage)

App type: Vite + React 19 + TS. 100% client-side (no backend). Data persists in browser localStorage/sessionStorage. All three roles can be exercised in a single browser session (orders are stored globally and visible to seller + delivery).

## Customer (Mobile OTP login)
- Phone: any (default prefilled `+91 98450 12345`)
- OTP: a simulated 6-digit code is shown on screen after "Send OTP"; the field is auto-prefilled. Master OTP `123456` also works.

## Seller (Email + Password login)
- Email: any non-"pending" email (default `ramesh.patel@shroomvalley.org`)
- Password: any (default `Seller123`)
- Note: emails containing "pending" are rejected (simulated approval gate).

## Delivery Partner (Rider ID + Password login)
- Rider ID: `RIDER-001` (also `RIDER-002`)
- Password: `Rider123` (any password accepted in demo)
- Unknown IDs are accepted as ad-hoc demo riders.

## Key data-testids
- guest-delivery-login-btn, auth-role-delivery, delivery-id-input, delivery-password-input, delivery-login-submit
- nav-delivery-active, nav-delivery-jobs, nav-delivery-history, delivery-logout-btn
- accept-job-{orderId}, pickup-{orderId}, arrived-{orderId}, verify-{orderId}, delivery-otp-input, confirm-delivery-btn, navigate-{orderId}
- customer-delivery-otp, delivery-handover-card, qr-image
