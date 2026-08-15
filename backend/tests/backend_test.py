"""Backend integration tests for Shroom & Veggies API (multi-seller + cloud sync)."""
import os
import time
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")

SELLER_EMAIL = "ramesh.patel@shroomvalley.org"
SELLER_PASSWORD = "Seller123"
RIDER_ID = "RIDER-001"
RIDER_PASSWORD = "Rider123"


# --------- Fixtures ---------
@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


def _auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def seller_token(s):
    r = s.post(f"{BASE_URL}/api/auth/seller/login", json={"email": SELLER_EMAIL, "password": SELLER_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def rider_token(s):
    r = s.post(f"{BASE_URL}/api/auth/rider/login", json={"agentId": RIDER_ID, "password": RIDER_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def customer_ctx(s):
    phone = f"+91 90000{int(time.time()) % 100000:05d}"
    r = s.post(f"{BASE_URL}/api/auth/customer/send-otp", json={"phone": phone})
    assert r.status_code == 200, r.text
    otp = r.json().get("otp")
    assert otp
    r2 = s.post(f"{BASE_URL}/api/auth/customer/verify-otp", json={"phone": phone, "otp": otp, "name": "TEST_Cust"})
    assert r2.status_code == 200, r2.text
    return {"token": r2.json()["token"], "phone": phone, "customer": r2.json()["customer"]}


# --------- Health ---------
class TestHealth:
    def test_health(self, s):
        r = s.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


# --------- Auth ---------
class TestAuth:
    def test_seller_login_ok(self, seller_token, s):
        r = s.get(f"{BASE_URL}/api/auth/me", headers=_auth(seller_token))
        assert r.status_code == 200
        assert r.json()["role"] == "seller"

    def test_seller_login_bad(self, s):
        r = s.post(f"{BASE_URL}/api/auth/seller/login", json={"email": SELLER_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_rider_login_ok(self, rider_token, s):
        r = s.get(f"{BASE_URL}/api/auth/me", headers=_auth(rider_token))
        assert r.status_code == 200
        assert r.json()["role"] == "rider"

    def test_rider_login_bad(self, s):
        r = s.post(f"{BASE_URL}/api/auth/rider/login", json={"agentId": RIDER_ID, "password": "wrong"})
        assert r.status_code == 401

    def test_customer_otp_flow(self, customer_ctx, s):
        r = s.get(f"{BASE_URL}/api/auth/me", headers=_auth(customer_ctx["token"]))
        assert r.status_code == 200
        assert r.json()["role"] == "customer"

    def test_customer_otp_master(self, s):
        phone = f"+91 91111{int(time.time()) % 100000:05d}"
        s.post(f"{BASE_URL}/api/auth/customer/send-otp", json={"phone": phone})
        r = s.post(f"{BASE_URL}/api/auth/customer/verify-otp", json={"phone": phone, "otp": "123456"})
        assert r.status_code == 200

    def test_me_unauth(self, s):
        r = s.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401


# --------- Multi-seller: register 2nd seller, add product, verify catalog + filter ---------
class TestMultiSeller:
    second = {}

    def test_register_second_seller(self, s):
        email = f"test_seller_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "farmName": "TEST_GreenAcre Farm",
            "ownerName": "Test Owner",
            "email": email,
            "password": "Test1234",
            "phone": "+91 90000 00001",
            "farmAddress": "Test Rd",
            "latitude": 12.98,
            "longitude": 77.60,
        }
        r = s.post(f"{BASE_URL}/api/auth/seller/register", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["seller"]["farmName"] == "TEST_GreenAcre Farm"
        TestMultiSeller.second["token"] = data["token"]
        TestMultiSeller.second["id"] = data["seller"]["id"]
        TestMultiSeller.second["email"] = email

    def test_register_duplicate(self, s):
        r = s.post(f"{BASE_URL}/api/auth/seller/register", json={
            "farmName": "dup", "ownerName": "x", "email": SELLER_EMAIL, "password": "x"
        })
        assert r.status_code == 409

    def test_second_seller_create_product(self, s):
        tok = TestMultiSeller.second["token"]
        body = {"name": "TEST_Baby Corn", "price": 45, "unit": "500g", "stock": 20,
                "image": "https://images.unsplash.com/photo-1", "category": "veggies", "description": "test"}
        r = s.post(f"{BASE_URL}/api/products", json=body, headers=_auth(tok))
        assert r.status_code == 200, r.text
        p = r.json()
        assert p["sellerId"] == TestMultiSeller.second["id"]
        assert p["sellerName"] == "TEST_GreenAcre Farm"
        TestMultiSeller.second["product_id"] = p["id"]

    def test_products_show_both_sellers(self, s):
        r = s.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        products = r.json()
        seller_ids = {p.get("sellerId") for p in products}
        assert TestMultiSeller.second["id"] in seller_ids
        # demo seller must also have at least one seeded product? Not guaranteed - just check second is present.
        # Also verify each has sellerName
        for p in products:
            assert "sellerName" in p

    def test_products_filter_by_seller(self, s):
        sid = TestMultiSeller.second["id"]
        r = s.get(f"{BASE_URL}/api/products?sellerId={sid}")
        assert r.status_code == 200
        for p in r.json():
            assert p["sellerId"] == sid

    def test_sellers_list_public(self, s):
        r = s.get(f"{BASE_URL}/api/sellers")
        assert r.status_code == 200
        ids = {x["id"] for x in r.json()}
        assert TestMultiSeller.second["id"] in ids


# --------- Order split across sellers ---------
class TestOrderSplit:
    ids = {}

    def _demo_seller_id(self, s):
        r = s.get(f"{BASE_URL}/api/sellers")
        for x in r.json():
            if x.get("sellerId") == "FARM-8821" or "ShroomValley" in (x.get("farmName") or ""):
                return x["id"]
        return None

    def test_ensure_demo_seller_has_product(self, s, seller_token):
        r = s.get(f"{BASE_URL}/api/products")
        demo_id = self._demo_seller_id(s)
        assert demo_id
        has = any(p.get("sellerId") == demo_id for p in r.json())
        if not has:
            body = {"name": "TEST_Oyster Mushroom", "price": 120, "unit": "250g", "stock": 30,
                    "image": "https://images.unsplash.com/photo-2", "category": "mushrooms"}
            rr = s.post(f"{BASE_URL}/api/products", json=body, headers=_auth(seller_token))
            assert rr.status_code == 200
        TestOrderSplit.ids["demo_seller"] = demo_id

    def test_customer_places_two_orders(self, s, customer_ctx):
        # get one product per seller
        r = s.get(f"{BASE_URL}/api/products")
        products = r.json()
        demo_id = TestOrderSplit.ids["demo_seller"]
        second_id = TestMultiSeller.second["id"]
        p_demo = next(p for p in products if p.get("sellerId") == demo_id)
        p_second = next(p for p in products if p.get("sellerId") == second_id)

        tok = customer_ctx["token"]
        for p in [p_demo, p_second]:
            body = {
                "items": [{"product": p, "quantity": 1}],
                "subtotal": p["price"], "deliveryFee": 30, "total": p["price"] + 30,
                "isPaid": False, "paymentMethod": "COD",
                "sellerId": p["sellerId"], "sellerName": p["sellerName"],
                "deliveryAddress": {"fullName": "TEST_Cust", "phone": customer_ctx["phone"],
                                     "street": "Test Rd", "pincode": "560001"},
            }
            r2 = s.post(f"{BASE_URL}/api/orders", json=body, headers=_auth(tok))
            assert r2.status_code == 200, r2.text
            o = r2.json()
            assert o["sellerId"] == p["sellerId"]
            assert "deliveryOtp" in o and len(o["deliveryOtp"]) == 6
            TestOrderSplit.ids.setdefault("orders", []).append(o["id"])

        # Verify list_orders as customer returns both, with distinct sellerIds
        r3 = s.get(f"{BASE_URL}/api/orders", headers=_auth(tok))
        assert r3.status_code == 200
        mine = r3.json()
        my_orders = [o for o in mine if o["id"] in TestOrderSplit.ids["orders"]]
        assert len(my_orders) == 2
        assert len({o["sellerId"] for o in my_orders}) == 2

    def test_seller_sees_only_own_orders(self, s, seller_token):
        r = s.get(f"{BASE_URL}/api/orders", headers=_auth(seller_token))
        assert r.status_code == 200
        for o in r.json():
            assert o["sellerId"] == TestOrderSplit.ids["demo_seller"]


# --------- Rider Onboarding ---------
class TestRiderOnboarding:
    created = {}

    def test_create_rider(self, s, seller_token):
        body = {"name": "TEST_Rider One", "phone": "+91 90000 22222",
                "vehicle": "Delivery Bike", "vehicleNumber": "KA-01-XX-0001",
                "zone": "Bengaluru", "password": "NewPass123"}
        r = s.post(f"{BASE_URL}/api/riders", json=body, headers=_auth(seller_token))
        assert r.status_code == 200, r.text
        rd = r.json()
        assert rd["agentId"].startswith("RIDER-")
        assert rd["name"] == "TEST_Rider One"
        TestRiderOnboarding.created = rd

    def test_list_riders(self, s, seller_token):
        r = s.get(f"{BASE_URL}/api/riders", headers=_auth(seller_token))
        assert r.status_code == 200
        ids = {x["agentId"] for x in r.json()}
        assert TestRiderOnboarding.created["agentId"] in ids

    def test_new_rider_can_login(self, s):
        r = s.post(f"{BASE_URL}/api/auth/rider/login",
                   json={"agentId": TestRiderOnboarding.created["agentId"], "password": "NewPass123"})
        assert r.status_code == 200, r.text
        assert r.json()["rider"]["agentId"] == TestRiderOnboarding.created["agentId"]

    def test_customer_cannot_create_rider(self, s, customer_ctx):
        r = s.post(f"{BASE_URL}/api/riders", json={"name": "x", "password": "y"},
                   headers=_auth(customer_ctx["token"]))
        assert r.status_code == 403

    def test_delete_rider(self, s, seller_token):
        rid = TestRiderOnboarding.created["id"]
        r = s.delete(f"{BASE_URL}/api/riders/{rid}", headers=_auth(seller_token))
        assert r.status_code == 200
        # verify gone
        r2 = s.get(f"{BASE_URL}/api/riders", headers=_auth(seller_token))
        assert TestRiderOnboarding.created["agentId"] not in {x["agentId"] for x in r2.json()}


# --------- Full delivery loop w/ demo rider ---------
class TestDeliveryLoop:
    def test_full_loop(self, s, seller_token, rider_token, customer_ctx):
        # 1. Customer places COD order with demo seller
        r = s.get(f"{BASE_URL}/api/products")
        demo_id = None
        for x in s.get(f"{BASE_URL}/api/sellers").json():
            if "ShroomValley" in (x.get("farmName") or ""):
                demo_id = x["id"]; break
        p = next(p for p in r.json() if p.get("sellerId") == demo_id)

        tok = customer_ctx["token"]
        order = {
            "items": [{"product": p, "quantity": 1}],
            "subtotal": p["price"], "deliveryFee": 30, "total": p["price"] + 30,
            "isPaid": False, "paymentMethod": "COD",
            "sellerId": demo_id, "sellerName": p["sellerName"],
            "deliveryAddress": {"fullName": "TEST_Cust", "phone": customer_ctx["phone"],
                                 "street": "Test Rd", "pincode": "560001"},
        }
        r0 = s.post(f"{BASE_URL}/api/orders", json=order, headers=_auth(tok))
        assert r0.status_code == 200
        oid_ = r0.json()["id"]
        otp = r0.json()["deliveryOtp"]

        # 2. Seller: Start Packing -> publish (Out for Delivery, Unassigned)
        cur = r0.json()
        cur["status"] = "Packing"
        s.put(f"{BASE_URL}/api/orders/{oid_}", json=cur, headers=_auth(seller_token))
        cur["status"] = "Out for Delivery"
        cur["deliveryStage"] = "Unassigned"
        r1 = s.put(f"{BASE_URL}/api/orders/{oid_}", json=cur, headers=_auth(seller_token))
        assert r1.status_code == 200

        # 3. Rider sees job in available list
        rlist = s.get(f"{BASE_URL}/api/orders", headers=_auth(rider_token))
        assert rlist.status_code == 200
        assert any(o["id"] == oid_ for o in rlist.json())

        # 4. Accept -> Picked up -> Arrived -> Delivered
        cur = next(o for o in rlist.json() if o["id"] == oid_)
        cur["assignedAgentId"] = RIDER_ID
        cur["deliveryStage"] = "Accepted"
        s.put(f"{BASE_URL}/api/orders/{oid_}", json=cur, headers=_auth(rider_token))
        cur["deliveryStage"] = "Picked Up"
        s.put(f"{BASE_URL}/api/orders/{oid_}", json=cur, headers=_auth(rider_token))
        cur["deliveryStage"] = "Arrived"
        s.put(f"{BASE_URL}/api/orders/{oid_}", json=cur, headers=_auth(rider_token))

        # 5. Verify OTP client side, mark Delivered
        cur["status"] = "Delivered"
        cur["deliveryStage"] = "Delivered"
        cur["codCollected"] = True
        r2 = s.put(f"{BASE_URL}/api/orders/{oid_}", json=cur, headers=_auth(rider_token))
        assert r2.status_code == 200
        assert r2.json()["status"] == "Delivered"
        assert r2.json()["deliveryOtp"] == otp  # OTP unchanged (server-owned)

        # 6. Rider location endpoint
        r3 = s.post(f"{BASE_URL}/api/orders/{oid_}/location", json={"lat": 12.95, "lng": 77.62},
                    headers=_auth(rider_token))
        assert r3.status_code == 200

        # Verify customer sees riderLat/Lng
        clist = s.get(f"{BASE_URL}/api/orders", headers=_auth(tok))
        o = next(o for o in clist.json() if o["id"] == oid_)
        assert o.get("riderLat") == 12.95
        assert o.get("riderLng") == 77.62


# --------- Cleanup ---------
@pytest.fixture(scope="session", autouse=True)
def _cleanup(request, s):
    yield
    # Best-effort cleanup: delete products & second seller docs directly via API is limited;
    # relying on TEST_ prefix for identification. Not deleting sellers/customers via API (no endpoint).
    tok = TestMultiSeller.second.get("token")
    pid = TestMultiSeller.second.get("product_id")
    if tok and pid:
        try:
            s.delete(f"{BASE_URL}/api/products/{pid}", headers=_auth(tok))
        except Exception:
            pass
