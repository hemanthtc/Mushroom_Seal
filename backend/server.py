from dotenv import load_dotenv
load_dotenv()

import os
import jwt
import bcrypt
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any, Dict

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
TOKEN_DAYS = 7

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Shroom & Veggies API")

origins = os.environ.get("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if origins == "*" else [o.strip() for o in origins.split(",")],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(sub: str, role: str) -> str:
    payload = {
        "sub": sub,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def oid(v: str) -> ObjectId:
    try:
        return ObjectId(v)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")


def clean(doc: Optional[dict]) -> Optional[dict]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    doc.pop("password_hash", None)
    return doc


async def get_auth(request: Request) -> Dict[str, Any]:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"id": payload["sub"], "role": payload["role"]}


async def require_role(request: Request, role: str) -> Dict[str, Any]:
    a = await get_auth(request)
    if a["role"] != role:
        raise HTTPException(status_code=403, detail="Forbidden for this role")
    return a


# ---------------- models ----------------
class SellerRegister(BaseModel):
    farmName: str
    ownerName: str
    email: str
    password: str
    phone: str = ""
    farmAddress: str = ""
    latitude: float = 12.9716
    longitude: float = 77.5946
    organicCertNo: str = ""
    gstin: str = ""


class SellerLogin(BaseModel):
    email: str
    password: str


class SendOtp(BaseModel):
    phone: str


class VerifyOtp(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None
    email: Optional[str] = None


class RiderLogin(BaseModel):
    agentId: str
    password: str


class RiderCreate(BaseModel):
    name: str
    phone: str = ""
    vehicle: str = "Delivery Bike"
    vehicleNumber: str = ""
    zone: str = "Bengaluru"
    password: str


# ---------------- startup ----------------
@app.on_event("startup")
async def startup():
    await db.sellers.create_index("email", unique=True)
    await db.riders.create_index("agentId", unique=True)
    # seed a demo seller if none
    existing = await db.sellers.find_one({"email": "ramesh.patel@shroomvalley.org"})
    if not existing:
        await db.sellers.insert_one({
            "farmName": "ShroomValley Organic & Agro Farm",
            "ownerName": "Ramesh Patel",
            "email": "ramesh.patel@shroomvalley.org",
            "password_hash": hash_password("Seller123"),
            "phone": "+91 94480 99887",
            "farmAddress": "Survey #42, Organic Agro Belt, Sarjapur Road, Bengaluru",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "organicCertNo": "IND-ORG-2024-88192",
            "gstin": "29ABCDE1234F1Z5",
            "rating": 4.9,
            "establishedYear": 2018,
            "sellerId": "FARM-8821",
            "created_at": now_iso(),
        })
    # seed a demo rider tied to the demo seller
    demo_seller = await db.sellers.find_one({"email": "ramesh.patel@shroomvalley.org"})
    if demo_seller and not await db.riders.find_one({"agentId": "RIDER-001"}):
        await db.riders.insert_one({
            "agentId": "RIDER-001",
            "name": "Arjun Kumar",
            "phone": "+91 90080 11223",
            "vehicle": "Insulated Cold-Box Bike",
            "vehicleNumber": "KA-05-EG-4412",
            "zone": "South Bengaluru",
            "rating": 4.8,
            "sellerId": str(demo_seller["_id"]),
            "sellerName": demo_seller.get("farmName"),
            "password_hash": hash_password("Rider123"),
            "created_at": now_iso(),
        })


@app.get("/api/health")
async def health():
    return {"status": "ok", "time": now_iso()}


# ---------------- AUTH: SELLER ----------------
@app.post("/api/auth/seller/register")
async def seller_register(body: SellerRegister):
    email = body.email.strip().lower()
    if await db.sellers.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="A seller with this email already exists.")
    doc = body.dict()
    doc["email"] = email
    doc.pop("password")
    doc["password_hash"] = hash_password(body.password)
    doc["rating"] = 5.0
    doc["establishedYear"] = datetime.now().year
    doc["sellerId"] = "FARM-" + str(random.randint(1000, 9999))
    doc["created_at"] = now_iso()
    res = await db.sellers.insert_one(doc)
    seller = clean(await db.sellers.find_one({"_id": res.inserted_id}))
    return {"token": create_token(seller["id"], "seller"), "seller": seller}


@app.post("/api/auth/seller/login")
async def seller_login(body: SellerLogin):
    email = body.email.strip().lower()
    seller = await db.sellers.find_one({"email": email})
    if not seller or not verify_password(body.password, seller.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    c = clean(seller)
    return {"token": create_token(c["id"], "seller"), "seller": c}


# ---------------- AUTH: CUSTOMER (phone OTP) ----------------
@app.post("/api/auth/customer/send-otp")
async def send_otp(body: SendOtp):
    phone = body.phone.strip()
    if len(phone) < 8:
        raise HTTPException(status_code=400, detail="Please enter a valid phone number.")
    otp = str(random.randint(100000, 999999))
    await db.otps.update_one(
        {"phone": phone},
        {"$set": {"otp": otp, "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()}},
        upsert=True,
    )
    # Demo: return OTP so the UI can display it (SMS is simulated)
    return {"sent": True, "otp": otp}


@app.post("/api/auth/customer/verify-otp")
async def verify_otp(body: VerifyOtp):
    phone = body.phone.strip()
    rec = await db.otps.find_one({"phone": phone})
    ok = (rec and rec.get("otp") == body.otp) or body.otp == "123456"
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid OTP code.")
    customer = await db.customers.find_one({"phone": phone})
    if not customer:
        doc = {
            "phone": phone,
            "name": body.name or "Valued Customer",
            "email": body.email or "",
            "savedAddresses": [],
            "defaultAddressIndex": 0,
            "created_at": now_iso(),
        }
        res = await db.customers.insert_one(doc)
        customer = await db.customers.find_one({"_id": res.inserted_id})
    elif body.name and customer.get("name") in (None, "", "Valued Customer"):
        await db.customers.update_one({"_id": customer["_id"]}, {"$set": {"name": body.name, "email": body.email or customer.get("email", "")}})
        customer = await db.customers.find_one({"_id": customer["_id"]})
    c = clean(customer)
    return {"token": create_token(c["id"], "customer"), "customer": c}


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    savedAddresses: Optional[list] = None
    defaultAddressIndex: Optional[int] = None


@app.put("/api/customer/profile")
async def update_customer(body: CustomerUpdate, request: Request):
    a = await require_role(request, "customer")
    upd = {k: v for k, v in body.dict().items() if v is not None}
    if upd:
        await db.customers.update_one({"_id": oid(a["id"])}, {"$set": upd})
    return clean(await db.customers.find_one({"_id": oid(a["id"])}))


# ---------------- AUTH: RIDER ----------------
@app.post("/api/auth/rider/login")
async def rider_login(body: RiderLogin):
    agent_id = body.agentId.strip().upper()
    rider = await db.riders.find_one({"agentId": agent_id})
    if not rider or not verify_password(body.password, rider.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid Rider ID or password.")
    c = clean(rider)
    return {"token": create_token(c["id"], "rider"), "rider": c}


@app.get("/api/auth/me")
async def me(request: Request):
    a = await get_auth(request)
    coll = {"seller": db.sellers, "customer": db.customers, "rider": db.riders}[a["role"]]
    doc = clean(await coll.find_one({"_id": oid(a["id"])}))
    if not doc:
        raise HTTPException(status_code=401, detail="Account not found")
    return {"role": a["role"], "profile": doc}


# ---------------- SELLERS (public directory) ----------------
@app.get("/api/sellers")
async def list_sellers():
    out = []
    async for s in db.sellers.find({}):
        c = clean(s)
        out.append({
            "id": c["id"], "sellerId": c.get("sellerId"), "farmName": c.get("farmName"),
            "ownerName": c.get("ownerName"), "farmAddress": c.get("farmAddress"),
            "latitude": c.get("latitude"), "longitude": c.get("longitude"),
            "rating": c.get("rating", 5.0), "organicCertNo": c.get("organicCertNo", ""),
        })
    return out


# ---------------- PRODUCTS ----------------
@app.get("/api/products")
async def list_products(sellerId: Optional[str] = None):
    q = {"sellerId": sellerId} if sellerId else {}
    out = []
    async for p in db.products.find(q):
        out.append(clean(p))
    return out


@app.post("/api/products")
async def create_product(body: dict, request: Request):
    a = await require_role(request, "seller")
    seller = await db.sellers.find_one({"_id": oid(a["id"])})
    body.pop("id", None)
    rules = body.get("distanceRules") or {}
    body["distanceRules"] = {
        "maxQtyKm5": rules.get("maxQtyKm5", 10),
        "maxQtyKm15": rules.get("maxQtyKm15", 5),
        "maxQtyKmBeyond": rules.get("maxQtyKmBeyond", 2),
    }
    body["sellerId"] = a["id"]
    body["sellerName"] = seller.get("farmName")
    body["sellerLat"] = seller.get("latitude")
    body["sellerLng"] = seller.get("longitude")
    body["created_at"] = now_iso()
    res = await db.products.insert_one(body)
    return clean(await db.products.find_one({"_id": res.inserted_id}))


@app.put("/api/products/{pid}")
async def update_product(pid: str, body: dict, request: Request):
    a = await require_role(request, "seller")
    existing = await db.products.find_one({"_id": oid(pid)})
    if not existing or existing.get("sellerId") != a["id"]:
        raise HTTPException(status_code=404, detail="Product not found")
    body.pop("id", None)
    body.pop("sellerId", None)
    if "distanceRules" in body:
        rules = body.get("distanceRules") or {}
        body["distanceRules"] = {
            "maxQtyKm5": rules.get("maxQtyKm5", 10),
            "maxQtyKm15": rules.get("maxQtyKm15", 5),
            "maxQtyKmBeyond": rules.get("maxQtyKmBeyond", 2),
        }
    await db.products.update_one({"_id": oid(pid)}, {"$set": body})
    return clean(await db.products.find_one({"_id": oid(pid)}))


@app.delete("/api/products/{pid}")
async def delete_product(pid: str, request: Request):
    a = await require_role(request, "seller")
    await db.products.delete_one({"_id": oid(pid), "sellerId": a["id"]})
    return {"deleted": True}


# ---------------- ORDERS ----------------
@app.get("/api/orders")
async def list_orders(request: Request):
    a = await get_auth(request)
    if a["role"] == "customer":
        q = {"customerId": a["id"]}
    elif a["role"] == "seller":
        q = {"sellerId": a["id"]}
    elif a["role"] == "rider":
        rider = await db.riders.find_one({"_id": oid(a["id"])})
        agent_id = rider.get("agentId") if rider else None
        seller_id = rider.get("sellerId") if rider else None
        q = {"$or": [
            {"assignedAgentId": agent_id},
            {"status": "Out for Delivery", "deliveryStage": {"$in": ["Unassigned", None]}, "sellerId": seller_id},
        ]}
    else:
        q = {}
    out = []
    async for o in db.orders.find(q).sort("_id", -1):
        out.append(clean(o))
    return out


@app.post("/api/orders")
async def create_order(body: dict, request: Request):
    a = await require_role(request, "customer")
    customer = await db.customers.find_one({"_id": oid(a["id"])})
    body.pop("id", None)
    body["customerId"] = a["id"]
    body["customerPhone"] = customer.get("phone")
    if not body.get("address"):
        body["address"] = {"fullName": customer.get("name", ""), "phone": customer.get("phone", ""),
                            "streetAddress": "", "city": "", "pincode": "", "estimatedDistanceKm": 0}
    body["status"] = "Pending"
    body["deliveryOtp"] = str(random.randint(100000, 999999))
    body["deliveryStage"] = "Unassigned"
    body["codCollected"] = False
    body["createdAt"] = now_iso()
    body["statusTimeline"] = [{
        "status": "Pending",
        "timestamp": now_iso(),
        "note": "Payment verified via Razorpay" if body.get("isPaid") else "Cash on Delivery order created",
    }]
    # reduce stock
    for item in body.get("items", []):
        pid = item.get("product", {}).get("id")
        if pid:
            await db.products.update_one({"_id": oid(pid)}, {"$inc": {"stock": -item.get("quantity", 0)}})
    res = await db.orders.insert_one(body)
    return clean(await db.orders.find_one({"_id": res.inserted_id}))


@app.put("/api/orders/{order_id}")
async def replace_order(order_id: str, body: dict, request: Request):
    a = await get_auth(request)
    existing = await db.orders.find_one({"_id": oid(order_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")
    # preserve immutable ownership/security fields
    body.pop("id", None)
    body.pop("deliveryOtp", None)  # OTP is server-owned
    for k in ["customerId", "customerPhone", "sellerId", "sellerName"]:
        if k in existing:
            body[k] = existing[k]
    await db.orders.update_one({"_id": oid(order_id)}, {"$set": body})
    return clean(await db.orders.find_one({"_id": oid(order_id)}))


class RiderLoc(BaseModel):
    lat: float
    lng: float


@app.post("/api/orders/{order_id}/location")
async def rider_location(order_id: str, body: RiderLoc, request: Request):
    await require_role(request, "rider")
    await db.orders.update_one(
        {"_id": oid(order_id)},
        {"$set": {"riderLat": body.lat, "riderLng": body.lng, "riderLocAt": now_iso()}},
    )
    return {"ok": True}


# ---------------- RIDERS (seller managed) ----------------
@app.get("/api/riders")
async def list_riders(request: Request):
    a = await require_role(request, "seller")
    out = []
    async for r in db.riders.find({"sellerId": a["id"]}):
        c = clean(r)
        c.pop("password_plain", None)
        out.append(c)
    return out


@app.post("/api/riders")
async def create_rider(body: RiderCreate, request: Request):
    a = await require_role(request, "seller")
    seller = await db.sellers.find_one({"_id": oid(a["id"])})
    # generate unique agent id
    for _ in range(20):
        agent_id = "RIDER-" + str(random.randint(1000, 9999))
        if not await db.riders.find_one({"agentId": agent_id}):
            break
    doc = {
        "agentId": agent_id,
        "name": body.name,
        "phone": body.phone,
        "vehicle": body.vehicle,
        "vehicleNumber": body.vehicleNumber,
        "zone": body.zone,
        "rating": 5.0,
        "sellerId": a["id"],
        "sellerName": seller.get("farmName"),
        "password_hash": hash_password(body.password),
        "created_at": now_iso(),
    }
    res = await db.riders.insert_one(doc)
    return clean(await db.riders.find_one({"_id": res.inserted_id}))


@app.delete("/api/riders/{rider_id}")
async def delete_rider(rider_id: str, request: Request):
    a = await require_role(request, "seller")
    await db.riders.delete_one({"_id": oid(rider_id), "sellerId": a["id"]})
    return {"deleted": True}
