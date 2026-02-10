from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gurukrupa_mess')]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'gurukrupa-mess-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="Gurukrupa Mess API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ MODELS ============

class UserRegister(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    address: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    language_pref: Optional[str] = None

class MenuItemCreate(BaseModel):
    name_en: str
    name_mr: str
    description_en: Optional[str] = ""
    description_mr: Optional[str] = ""
    category: str  # rice, roti, sabzi, dal, sweet, salad, extra
    price: float = 0
    day_of_week: str  # monday, tuesday, ..., sunday, daily
    is_available: bool = True
    image_url: Optional[str] = ""

class MenuItemUpdate(BaseModel):
    name_en: Optional[str] = None
    name_mr: Optional[str] = None
    description_en: Optional[str] = None
    description_mr: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    day_of_week: Optional[str] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None

class PlanCreate(BaseModel):
    name_en: str
    name_mr: str
    description_en: str
    description_mr: str
    price: float
    duration_days: int
    meals_per_day: int = 1
    is_active: bool = True

class OrderCreate(BaseModel):
    items: List[dict]  # [{name, qty, price}]
    total: float
    order_type: str = "single"  # single or subscription
    delivery_address: Optional[str] = ""
    notes: Optional[str] = ""

class OrderStatusUpdate(BaseModel):
    status: str  # pending, preparing, out_for_delivery, delivered, cancelled

class SubscriptionCreate(BaseModel):
    plan_id: str
    start_date: Optional[str] = None

# ============ AUTH HELPERS ============

def create_token(user_id: str, role: str):
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "role": role, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "password_hash": pwd_context.hash(data.password),
        "address": data.address or "",
        "role": "customer",
        "language_pref": "en",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    token = create_token(user_id, "customer")
    return {
        "token": token,
        "user": {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not pwd_context.verify(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user.get("role", "customer"))
    user_data = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"token": token, "user": user_data}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {k: v for k, v in user.items() if k not in ("password_hash",)}

@api_router.put("/auth/profile")
async def update_profile(data: UserUpdate, user=Depends(get_current_user)):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated

# ============ MENU ROUTES ============

@api_router.get("/menu")
async def get_menu(day: Optional[str] = None):
    query = {"is_available": True}
    if day:
        query["$or"] = [{"day_of_week": day.lower()}, {"day_of_week": "daily"}]
    items = await db.menu_items.find(query, {"_id": 0}).to_list(200)
    return items

@api_router.get("/menu/weekly")
async def get_weekly_menu():
    items = await db.menu_items.find({"is_available": True}, {"_id": 0}).to_list(500)
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    weekly = {}
    for day in days:
        weekly[day] = [i for i in items if i.get("day_of_week") == day or i.get("day_of_week") == "daily"]
    return weekly

@api_router.post("/menu")
async def create_menu_item(data: MenuItemCreate, admin=Depends(require_admin)):
    item = data.dict()
    item["id"] = str(uuid.uuid4())
    item["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.menu_items.insert_one(item)
    return {k: v for k, v in item.items() if k != "_id"}

@api_router.put("/menu/{item_id}")
async def update_menu_item(item_id: str, data: MenuItemUpdate, admin=Depends(require_admin)):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.menu_items.update_one({"id": item_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    updated = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    return updated

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, admin=Depends(require_admin)):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Deleted"}

# ============ PLANS ROUTES ============

@api_router.get("/plans")
async def get_plans():
    plans = await db.subscription_plans.find({"is_active": True}, {"_id": 0}).to_list(50)
    return plans

@api_router.post("/plans")
async def create_plan(data: PlanCreate, admin=Depends(require_admin)):
    plan = data.dict()
    plan["id"] = str(uuid.uuid4())
    plan["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.subscription_plans.insert_one(plan)
    return {k: v for k, v in plan.items() if k != "_id"}

@api_router.put("/plans/{plan_id}")
async def update_plan(plan_id: str, data: dict, admin=Depends(require_admin)):
    result = await db.subscription_plans.update_one({"id": plan_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    updated = await db.subscription_plans.find_one({"id": plan_id}, {"_id": 0})
    return updated

# ============ ORDER ROUTES ============

@api_router.post("/orders")
async def create_order(data: OrderCreate, user=Depends(get_current_user)):
    order = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", ""),
        "user_phone": user.get("phone", ""),
        "items": data.items,
        "total": data.total,
        "order_type": data.order_type,
        "delivery_address": data.delivery_address or user.get("address", ""),
        "notes": data.notes or "",
        "status": "pending",
        "payment_status": "paid",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)
    return {k: v for k, v in order.items() if k != "_id"}

@api_router.get("/orders")
async def get_user_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/all")
async def get_all_orders(
    status: Optional[str] = None,
    admin=Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, data: OrderStatusUpdate, admin=Depends(require_admin)):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return updated

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user=Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.get("role") != "admin" and order.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return order

# ============ SUBSCRIPTION ROUTES ============

@api_router.post("/subscriptions")
async def create_subscription(data: SubscriptionCreate, user=Depends(get_current_user)):
    plan = await db.subscription_plans.find_one({"id": data.plan_id}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    start = datetime.now(timezone.utc) if not data.start_date else datetime.fromisoformat(data.start_date)
    end = start + timedelta(days=plan["duration_days"])
    
    sub = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("name", ""),
        "plan_id": plan["id"],
        "plan_name_en": plan.get("name_en", ""),
        "plan_name_mr": plan.get("name_mr", ""),
        "price": plan["price"],
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "status": "active",
        "payment_status": "paid",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.subscriptions.insert_one(sub)
    return {k: v for k, v in sub.items() if k != "_id"}

@api_router.get("/subscriptions")
async def get_user_subscriptions(user=Depends(get_current_user)):
    subs = await db.subscriptions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return subs

@api_router.get("/subscriptions/all")
async def get_all_subscriptions(admin=Depends(require_admin)):
    subs = await db.subscriptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return subs

# ============ ADMIN ROUTES ============

@api_router.get("/admin/dashboard")
async def admin_dashboard(admin=Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    preparing_orders = await db.orders.count_documents({"status": "preparing"})
    delivered_orders = await db.orders.count_documents({"status": "delivered"})
    total_customers = await db.users.count_documents({"role": "customer"})
    active_subs = await db.subscriptions.count_documents({"status": "active"})
    
    # Revenue
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total"}}}]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Today's orders
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await db.orders.count_documents({"created_at": {"$gte": today_start.isoformat()}})
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "preparing_orders": preparing_orders,
        "delivered_orders": delivered_orders,
        "total_customers": total_customers,
        "active_subscriptions": active_subs,
        "total_revenue": total_revenue,
        "today_orders": today_orders,
    }

@api_router.get("/admin/customers")
async def get_customers(admin=Depends(require_admin)):
    customers = await db.users.find({"role": "customer"}, {"_id": 0, "password_hash": 0}).to_list(500)
    return customers

# ============ MOCK PAYMENT ============

@api_router.post("/payment/mock")
async def mock_payment(data: dict, user=Depends(get_current_user)):
    """Mock Razorpay payment - always succeeds"""
    return {
        "payment_id": f"pay_{uuid.uuid4().hex[:16]}",
        "order_id": data.get("order_id", ""),
        "amount": data.get("amount", 0),
        "currency": "INR",
        "status": "captured",
        "method": "mock_razorpay",
    }

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    """Seed initial data for demo"""
    # Check if already seeded
    existing = await db.users.find_one({"email": "admin@gurukrupa.com"})
    if existing:
        return {"message": "Data already seeded"}
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin_user = {
        "id": admin_id,
        "name": "Admin",
        "email": "admin@gurukrupa.com",
        "phone": "9876543210",
        "password_hash": pwd_context.hash("admin123"),
        "address": "Gurukrupa Mess, Pune",
        "role": "admin",
        "language_pref": "en",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(admin_user)
    
    # Create demo customer
    cust_id = str(uuid.uuid4())
    customer = {
        "id": cust_id,
        "name": "Rahul Patil",
        "email": "rahul@test.com",
        "phone": "9876543211",
        "password_hash": pwd_context.hash("test123"),
        "address": "Flat 301, Sunrise Apartments, Kothrud, Pune",
        "role": "customer",
        "language_pref": "en",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(customer)
    
    # Seed menu items
    menu_items = [
        {"name_en": "Dal Tadka", "name_mr": "डाळ तडका", "description_en": "Yellow lentils tempered with spices", "description_mr": "मसाल्यांसह पिवळी डाळ", "category": "dal", "price": 0, "day_of_week": "daily", "is_available": True, "image_url": ""},
        {"name_en": "Chapati (4 pcs)", "name_mr": "चपाती (४ नग)", "description_en": "Freshly made wheat chapatis", "description_mr": "ताज्या गव्हाच्या चपात्या", "category": "roti", "price": 0, "day_of_week": "daily", "is_available": True, "image_url": ""},
        {"name_en": "Steamed Rice", "name_mr": "वाफवलेला भात", "description_en": "Plain steamed basmati rice", "description_mr": "साधा बासमती भात", "category": "rice", "price": 0, "day_of_week": "daily", "is_available": True, "image_url": ""},
        {"name_en": "Aloo Gobi", "name_mr": "आलू गोबी", "description_en": "Potato and cauliflower curry", "description_mr": "बटाटा आणि फुलकोबी भाजी", "category": "sabzi", "price": 0, "day_of_week": "monday", "is_available": True, "image_url": ""},
        {"name_en": "Paneer Butter Masala", "name_mr": "पनीर बटर मसाला", "description_en": "Cottage cheese in rich tomato gravy", "description_mr": "टोमॅटो ग्रेव्हीमध्ये पनीर", "category": "sabzi", "price": 0, "day_of_week": "tuesday", "is_available": True, "image_url": ""},
        {"name_en": "Bhindi Masala", "name_mr": "भिंडी मसाला", "description_en": "Spiced okra stir-fry", "description_mr": "मसालेदार भेंडी", "category": "sabzi", "price": 0, "day_of_week": "wednesday", "is_available": True, "image_url": ""},
        {"name_en": "Mix Veg Curry", "name_mr": "मिक्स भाजी", "description_en": "Seasonal mixed vegetables", "description_mr": "हंगामी मिश्र भाज्या", "category": "sabzi", "price": 0, "day_of_week": "thursday", "is_available": True, "image_url": ""},
        {"name_en": "Chole", "name_mr": "छोले", "description_en": "Spiced chickpea curry", "description_mr": "मसालेदार चणे", "category": "sabzi", "price": 0, "day_of_week": "friday", "is_available": True, "image_url": ""},
        {"name_en": "Matki Usal", "name_mr": "मटकी उसळ", "description_en": "Sprouted moth beans curry", "description_mr": "अंकुरित मटकी उसळ", "category": "sabzi", "price": 0, "day_of_week": "saturday", "is_available": True, "image_url": ""},
        {"name_en": "Varan Bhaat", "name_mr": "वरण भात", "description_en": "Traditional dal rice combo", "description_mr": "पारंपारिक वरण भात", "category": "sabzi", "price": 0, "day_of_week": "sunday", "is_available": True, "image_url": ""},
        {"name_en": "Pickle", "name_mr": "लोणचे", "description_en": "Homemade mango pickle", "description_mr": "घरगुती आंब्याचे लोणचे", "category": "extra", "price": 0, "day_of_week": "daily", "is_available": True, "image_url": ""},
        {"name_en": "Salad", "name_mr": "सॅलड", "description_en": "Fresh onion, cucumber salad", "description_mr": "ताजे कांदा, काकडी सॅलड", "category": "salad", "price": 0, "day_of_week": "daily", "is_available": True, "image_url": ""},
        {"name_en": "Gulab Jamun", "name_mr": "गुलाब जामुन", "description_en": "Sweet milk dumplings", "description_mr": "गोड दुधाचे गुलाब जामुन", "category": "sweet", "price": 0, "day_of_week": "sunday", "is_available": True, "image_url": ""},
        {"name_en": "Shira", "name_mr": "शिरा", "description_en": "Semolina sweet pudding", "description_mr": "रव्याचा गोड शिरा", "category": "sweet", "price": 0, "day_of_week": "wednesday", "is_available": True, "image_url": ""},
    ]
    
    for item in menu_items:
        item["id"] = str(uuid.uuid4())
        item["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.menu_items.insert_many(menu_items)
    
    # Seed subscription plans
    plans = [
        {
            "id": str(uuid.uuid4()),
            "name_en": "Weekly Plan",
            "name_mr": "साप्ताहिक प्लॅन",
            "description_en": "7 days of delicious home-style meals. Lunch tiffin delivered daily.",
            "description_mr": "७ दिवसांचे स्वादिष्ट घरगुती जेवण. रोज दुपारचा डबा.",
            "price": 490,
            "duration_days": 7,
            "meals_per_day": 1,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "name_en": "Monthly Plan",
            "name_mr": "मासिक प्लॅन",
            "description_en": "30 days of wholesome meals. Best value! Lunch tiffin delivered daily.",
            "description_mr": "३० दिवसांचे पौष्टिक जेवण. सर्वोत्तम किंमत! रोज दुपारचा डबा.",
            "price": 1800,
            "duration_days": 30,
            "meals_per_day": 1,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "name_en": "Monthly - 2 Meals",
            "name_mr": "मासिक - २ जेवण",
            "description_en": "30 days, Lunch + Dinner. Complete meal solution for busy professionals.",
            "description_mr": "३० दिवस, दुपार + रात्री. व्यस्त व्यावसायिकांसाठी संपूर्ण जेवण.",
            "price": 3200,
            "duration_days": 30,
            "meals_per_day": 2,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.subscription_plans.insert_many(plans)
    
    # Create some demo orders
    demo_orders = [
        {
            "id": str(uuid.uuid4()),
            "user_id": cust_id,
            "user_name": "Rahul Patil",
            "user_phone": "9876543211",
            "items": [{"name": "Lunch Tiffin", "qty": 1, "price": 80}],
            "total": 80,
            "order_type": "single",
            "delivery_address": "Flat 301, Sunrise Apartments, Kothrud, Pune",
            "notes": "",
            "status": "delivered",
            "payment_status": "paid",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "updated_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": cust_id,
            "user_name": "Rahul Patil",
            "user_phone": "9876543211",
            "items": [{"name": "Lunch Tiffin", "qty": 1, "price": 80}],
            "total": 80,
            "order_type": "single",
            "delivery_address": "Flat 301, Sunrise Apartments, Kothrud, Pune",
            "notes": "Extra chapati please",
            "status": "preparing",
            "payment_status": "paid",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    ]
    await db.orders.insert_many(demo_orders)
    
    return {"message": "Seed data created successfully", "admin_email": "admin@gurukrupa.com", "admin_password": "admin123", "customer_email": "rahul@test.com", "customer_password": "test123"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
