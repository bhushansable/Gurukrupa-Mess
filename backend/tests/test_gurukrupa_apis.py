"""
Backend API tests for Gurukrupa Mess
Tests: seed data, auth (customer + admin), menu, plans, orders, subscriptions
"""
import pytest
import requests
import os
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env to get BASE_URL
frontend_env = Path(__file__).parent.parent.parent / 'frontend' / '.env'
load_dotenv(frontend_env)

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://daily-mess-box.preview.emergentagent.com')

class TestSeedData:
    """Test seed data creation"""
    
    def test_seed_endpoint(self):
        """POST /api/seed should seed demo data"""
        response = requests.post(f"{BASE_URL}/api/seed")
        assert response.status_code == 200, f"Seed failed: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"✓ Seed endpoint working: {data['message']}")


class TestAuthentication:
    """Test authentication flows - customer and admin login"""
    
    def test_customer_login(self):
        """POST /api/auth/login with customer credentials should return token and user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "rahul@test.com", "password": "test123"}
        )
        assert response.status_code == 200, f"Customer login failed: {response.text}"
        
        data = response.json()
        assert "token" in data, "Token missing in response"
        assert "user" in data, "User missing in response"
        assert data["user"]["email"] == "rahul@test.com"
        assert data["user"]["role"] == "customer"
        print(f"✓ Customer login successful: {data['user']['name']}")
        
        # Verify token works by calling /auth/me
        headers = {"Authorization": f"Bearer {data['token']}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        print(f"✓ Customer token verified with /auth/me")
    
    def test_admin_login(self):
        """POST /api/auth/login with admin credentials should return admin user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@gurukrupa.com", "password": "admin123"}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@gurukrupa.com"
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['name']}")
        
        # Verify admin token works
        headers = {"Authorization": f"Bearer {data['token']}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        print(f"✓ Admin token verified with /auth/me")
    
    def test_invalid_login(self):
        """Invalid credentials should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@test.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print(f"✓ Invalid login correctly rejected")


class TestMenu:
    """Test menu endpoints"""
    
    def test_get_menu(self):
        """GET /api/menu should return menu items"""
        response = requests.get(f"{BASE_URL}/api/menu")
        assert response.status_code == 200, f"Get menu failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Menu should be a list"
        assert len(data) > 0, "Menu should have items"
        
        # Verify structure of first item
        item = data[0]
        assert "name_en" in item
        assert "name_mr" in item
        assert "category" in item
        assert "day_of_week" in item
        assert "is_available" in item
        assert "_id" not in item, "MongoDB _id should be excluded"
        print(f"✓ Menu endpoint returned {len(data)} items")
    
    def test_get_weekly_menu(self):
        """GET /api/menu/weekly should return weekly menu grouped by day"""
        response = requests.get(f"{BASE_URL}/api/menu/weekly")
        assert response.status_code == 200, f"Get weekly menu failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, dict), "Weekly menu should be a dict"
        
        # Verify all days are present
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        for day in days:
            assert day in data, f"Day {day} missing from weekly menu"
            assert isinstance(data[day], list), f"{day} should be a list"
        
        # Verify daily items appear in all days
        monday_items = data["monday"]
        daily_items = [item for item in monday_items if item.get("day_of_week") == "daily"]
        print(f"✓ Weekly menu has {len(daily_items)} daily items")
        print(f"✓ Weekly menu endpoint working with all 7 days")


class TestPlans:
    """Test subscription plans"""
    
    def test_get_plans(self):
        """GET /api/plans should return subscription plans"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200, f"Get plans failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Plans should be a list"
        assert len(data) >= 3, "Should have at least 3 plans"
        
        # Verify plan structure
        plan = data[0]
        assert "name_en" in plan
        assert "name_mr" in plan
        assert "price" in plan
        assert "duration_days" in plan
        assert "meals_per_day" in plan
        assert "_id" not in plan
        print(f"✓ Plans endpoint returned {len(data)} plans")


class TestOrders:
    """Test order endpoints with authentication"""
    
    @pytest.fixture
    def customer_token(self):
        """Get customer token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "rahul@test.com", "password": "test123"}
        )
        return response.json()["token"]
    
    def test_create_order(self, customer_token):
        """POST /api/orders should create an order"""
        headers = {"Authorization": f"Bearer {customer_token}"}
        order_data = {
            "items": [{"name": "TEST Lunch Tiffin", "qty": 1, "price": 80}],
            "total": 80,
            "order_type": "single",
            "delivery_address": "Test Address",
            "notes": "Test order from pytest"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json=order_data,
            headers=headers
        )
        assert response.status_code == 200, f"Create order failed: {response.text}"
        
        data = response.json()
        assert "id" in data
        assert data["total"] == 80
        assert data["status"] == "pending"
        assert "_id" not in data
        print(f"✓ Order created successfully: {data['id']}")
        
        # Verify order persists by fetching it
        order_id = data["id"]
        get_response = requests.get(f"{BASE_URL}/api/orders/{order_id}", headers=headers)
        assert get_response.status_code == 200
        fetched_order = get_response.json()
        assert fetched_order["id"] == order_id
        assert fetched_order["total"] == 80
        print(f"✓ Order verified via GET /api/orders/{order_id}")
    
    def test_get_user_orders(self, customer_token):
        """GET /api/orders should return user's orders"""
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/api/orders", headers=headers)
        assert response.status_code == 200, f"Get orders failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "User should have orders (from seed + test)"
        print(f"✓ User orders endpoint returned {len(data)} orders")


class TestPayment:
    """Test mock payment endpoint"""
    
    @pytest.fixture
    def customer_token(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "rahul@test.com", "password": "test123"}
        )
        return response.json()["token"]
    
    def test_mock_payment(self, customer_token):
        """POST /api/payment/mock should always succeed"""
        headers = {"Authorization": f"Bearer {customer_token}"}
        payment_data = {
            "amount": 100,
            "order_id": "test_order_123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/payment/mock",
            json=payment_data,
            headers=headers
        )
        assert response.status_code == 200, f"Mock payment failed: {response.text}"
        
        data = response.json()
        assert "payment_id" in data
        assert data["status"] == "captured"
        assert data["amount"] == 100
        print(f"✓ Mock payment successful: {data['payment_id']}")


class TestAdminEndpoints:
    """Test admin-only endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@gurukrupa.com", "password": "admin123"}
        )
        return response.json()["token"]
    
    def test_admin_dashboard(self, admin_token):
        """GET /api/admin/dashboard should return stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        assert response.status_code == 200, f"Admin dashboard failed: {response.text}"
        
        data = response.json()
        assert "total_orders" in data
        assert "total_customers" in data
        assert "total_revenue" in data
        assert "pending_orders" in data
        print(f"✓ Admin dashboard stats: {data['total_orders']} orders, {data['total_customers']} customers")
    
    def test_customer_cannot_access_admin_dashboard(self):
        """Customer token should not access admin endpoints"""
        # Get customer token
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "rahul@test.com", "password": "test123"}
        )
        customer_token = response.json()["token"]
        
        headers = {"Authorization": f"Bearer {customer_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=headers)
        assert response.status_code == 403, "Customer should not access admin endpoints"
        print(f"✓ Admin endpoints properly protected")
