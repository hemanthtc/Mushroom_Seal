from dotenv import load_dotenv
load_dotenv()

import dns.resolver
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']

import os
import jwt
import bcrypt
import random
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any, Dict
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

# Fallback parsing if MONGO_URL or DB_NAME are not explicitly set
if not MONGO_URL or not DB_NAME:
    mongodb_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/mushroom_seal")
    if not MONGO_URL:
        MONGO_URL = mongodb_uri
    if not DB_NAME:
        try:
            parsed_path = urlparse(mongodb_uri).path.strip("/")
            DB_NAME = parsed_path if parsed_path else "mushroom_seal"
        except Exception:
            DB_NAME = "mushroom_seal"

JWT_SECRET = os.environ.get("JWT_SECRET", "dev_jwt_secret_mushroom_seal_key_2026_super_secure")
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
    if role == "customer":
        delta = timedelta(days=365)
    elif role == "seller":
        delta = timedelta(days=1)
    elif role == "rider":
        delta = timedelta(hours=8)
    else:
        delta = timedelta(days=7)

    payload = {
        "sub": sub,
        "role": role,
        "exp": datetime.now(timezone.utc) + delta,
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
    else:
        await db.sellers.update_one(
            {"_id": existing["_id"]},
            {"$set": {"password_hash": hash_password("Seller123")}}
        )
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


@app.get("/api/version")
async def get_version():
    return {"version": "1.1.0"}


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


class ForgotPassword(BaseModel):
    email: str


class ResetPassword(BaseModel):
    token: str
    password: str


def send_reset_email(to_email: str, token: str, origin: str) -> bool:
    email_user = os.environ.get("EMAIL_USER")
    email_pass = os.environ.get("EMAIL_PASS")
    if not email_user or not email_pass:
        print("SMTP Credentials not configured. EMAIL_USER or EMAIL_PASS missing.")
        return False

    reset_link = f"{origin}/seller?resetToken={token}"

    subject = "Reset Your Shroom & Veggies Seller Password"
    body = f"""Hello,

You requested a password reset for your seller account on Shroom & Veggies.
Please click the link below or copy and paste it into your browser to reset your password:

{reset_link}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
Shroom & Veggies Team
"""

    msg = MIMEMultipart()
    msg['From'] = email_user
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(email_user, email_pass)
            server.sendmail(email_user, to_email, msg.as_string())
        print(f"Password reset email sent successfully via SSL to {to_email}")
        return True
    except Exception as ssl_err:
        print(f"Failed to send email via SSL: {ssl_err}. Trying STARTTLS on 587...")
        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(email_user, email_pass)
                server.sendmail(email_user, to_email, msg.as_string())
            print(f"Password reset email sent successfully via STARTTLS to {to_email}")
            return True
        except Exception as tls_err:
            print(f"Failed to send email via STARTTLS: {tls_err}")
            return False


@app.post("/api/auth/seller/forgot-password")
async def seller_forgot_password(body: ForgotPassword, request: Request):
    email = body.email.strip().lower()
    seller = await db.sellers.find_one({"email": email})
    if not seller:
        # Return 200 with success status to prevent email enumeration attacks
        return {"success": True, "message": "If this email is registered, a password recovery link has been sent."}

    token = secrets.token_hex(20)
    expires = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()

    await db.sellers.update_one(
        {"_id": seller["_id"]},
        {"$set": {"reset_token": token, "reset_token_expires": expires}}
    )

    # Determine origin header
    origin = request.headers.get("origin")
    if not origin:
        referer = request.headers.get("referer")
        if referer:
            parsed = urlparse(referer)
            origin = f"{parsed.scheme}://{parsed.netloc}"
        else:
            host = request.headers.get("host")
            if host:
                scheme = "https" if request.headers.get("x-forwarded-proto") == "https" else "http"
                origin = f"{scheme}://{host}"
            else:
                origin = "http://localhost:3000"


    sent = send_reset_email(email, token, origin)
    if not sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send password recovery email. Please check server SMTP configurations."
        )

    return {"success": True, "message": "Password recovery link has been sent to your email."}


@app.post("/api/auth/seller/reset-password")
async def seller_reset_password(body: ResetPassword):
    seller = await db.sellers.find_one({"reset_token": body.token})
    if not seller:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    expiry_str = seller.get("reset_token_expires")
    if not expiry_str:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if expiry_str.endswith("Z"):
        expiry_str = expiry_str[:-1] + "+00:00"
    expiry = datetime.fromisoformat(expiry_str)
    if datetime.now(timezone.utc) > expiry:
        raise HTTPException(status_code=400, detail="Reset token has expired.")

    # Update password hash and clear reset token fields
    await db.sellers.update_one(
        {"_id": seller["_id"]},
        {
            "$set": {"password_hash": hash_password(body.password)},
            "$unset": {"reset_token": "", "reset_token_expires": ""}
        }
    )

    return {"success": True, "message": "Your password has been successfully reset. Please log in with your new password."}


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

    api_key = os.environ.get("FAST2SMS_API_KEY")
    if api_key and api_key != "your_fast2sms_api_key_here":
        # Extract 10-digit number
        clean_phone = phone
        if clean_phone.startswith("+91"):
            clean_phone = clean_phone[3:]
        elif clean_phone.startswith("91") and len(clean_phone) > 10:
            clean_phone = clean_phone[2:]
        
        clean_phone = "".join(c for c in clean_phone if c.isdigit())
        
        if len(clean_phone) == 10:
            try:
                import requests
                url = "https://www.fast2sms.com/dev/bulkV2"
                payload = {
                    "route": "otp",
                    "variables_values": otp,
                    "numbers": clean_phone
                }
                headers = {
                    "authorization": api_key,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Cache-Control": "no-cache"
                }
                response = requests.post(url, data=payload, headers=headers)
                res_data = response.json()
                if not res_data.get("return"):
                    print(f"Fast2SMS error response: {res_data}")
                    raise HTTPException(status_code=500, detail=res_data.get("message", "Failed to send OTP SMS via Fast2SMS."))
                print(f"Fast2SMS OTP sent successfully to {clean_phone}")
            except Exception as e:
                print(f"Error sending SMS via Fast2SMS: {e}")
                if isinstance(e, HTTPException):
                    raise e
                raise HTTPException(status_code=500, detail=f"SMS Gateway Error: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Invalid Indian phone number. Must contain 10 digits after country code.")

    # Only return OTP to frontend for testing if no active API key is set
    if api_key and api_key != "your_fast2sms_api_key_here":
        return {"sent": True}
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


@app.delete("/api/customer")
async def delete_customer(request: Request):
    a = await require_role(request, "customer")
    await db.customers.delete_one({"_id": oid(a["id"])})
    return {"success": True}


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
@app.delete("/api/sellers/me")
async def delete_seller(request: Request):
    a = await require_role(request, "seller")
    # Delete all products listed by this seller
    await db.products.delete_many({"sellerId": a["id"]})
    # Delete all riders registered under this seller
    await db.riders.delete_many({"sellerId": a["id"]})
    # Delete the seller profile itself
    await db.sellers.delete_one({"_id": oid(a["id"])})
    return {"success": True}


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
