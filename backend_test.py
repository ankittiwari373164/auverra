#!/usr/bin/env python3
"""
Comprehensive backend API test suite for Auverra Watches
Tests all endpoints: auth, products, cart, wishlist, orders, reviews, newsletter, contact, admin
"""

import requests
import json
import uuid
from datetime import datetime

# Base URL from .env
BASE_URL = "https://watch-pinnacle.preview.emergentagent.com/api"

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_pass(test_name):
    print(f"✅ PASS: {test_name}")
    test_results["passed"].append(test_name)

def log_fail(test_name, reason):
    print(f"❌ FAIL: {test_name} - {reason}")
    test_results["failed"].append(f"{test_name}: {reason}")

def log_warning(test_name, reason):
    print(f"⚠️  WARNING: {test_name} - {reason}")
    test_results["warnings"].append(f"{test_name}: {reason}")

def print_summary():
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"✅ Passed: {len(test_results['passed'])}")
    print(f"❌ Failed: {len(test_results['failed'])}")
    print(f"⚠️  Warnings: {len(test_results['warnings'])}")
    
    if test_results['failed']:
        print("\nFailed Tests:")
        for fail in test_results['failed']:
            print(f"  - {fail}")
    
    if test_results['warnings']:
        print("\nWarnings:")
        for warn in test_results['warnings']:
            print(f"  - {warn}")
    print("="*80)

# Session for maintaining cookies
session = requests.Session()
test_user_email = f"test-{uuid.uuid4()}@auverra-test.com"
test_user_password = "TestPass123!"
test_user_name = "Test User"

print("="*80)
print("AUVERRA WATCHES BACKEND API TEST SUITE")
print("="*80)
print(f"Base URL: {BASE_URL}")
print(f"Test User: {test_user_email}")
print("="*80 + "\n")

# ============================================================================
# 1. HEALTH CHECK & SEED
# ============================================================================
print("\n[1] HEALTH CHECK & SEED")
print("-" * 80)

try:
    resp = session.get(f"{BASE_URL}/")
    if resp.status_code == 200 and resp.json().get("ok"):
        log_pass("Health check (GET /api/)")
    else:
        log_fail("Health check", f"Status {resp.status_code}, body: {resp.text}")
except Exception as e:
    log_fail("Health check", str(e))

# ============================================================================
# 2. PRODUCT ENDPOINTS (PUBLIC)
# ============================================================================
print("\n[2] PRODUCT ENDPOINTS")
print("-" * 80)

# GET /api/products (should auto-seed and return ~10 products)
try:
    resp = session.get(f"{BASE_URL}/products")
    if resp.status_code == 200:
        data = resp.json()
        items = data.get("items", [])
        if len(items) >= 10:
            log_pass(f"GET /api/products (returned {len(items)} products)")
        else:
            log_warning("GET /api/products", f"Expected ~10 products, got {len(items)}")
    else:
        log_fail("GET /api/products", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products", str(e))

# GET /api/products?category=chronograph
try:
    resp = session.get(f"{BASE_URL}/products?category=chronograph")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if all(p.get("category") == "chronograph" for p in items):
            log_pass(f"GET /api/products?category=chronograph (filtered {len(items)} items)")
        else:
            log_fail("Category filter", "Some items don't match category")
    else:
        log_fail("GET /api/products?category=chronograph", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products?category=chronograph", str(e))

# GET /api/products?collection=heritage
try:
    resp = session.get(f"{BASE_URL}/products?collection=heritage")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        log_pass(f"GET /api/products?collection=heritage (filtered {len(items)} items)")
    else:
        log_fail("GET /api/products?collection=heritage", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products?collection=heritage", str(e))

# GET /api/products?search=titanium
try:
    resp = session.get(f"{BASE_URL}/products?search=titanium")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if len(items) > 0:
            log_pass(f"GET /api/products?search=titanium (found {len(items)} items)")
        else:
            log_warning("Search titanium", "No results found")
    else:
        log_fail("GET /api/products?search=titanium", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products?search=titanium", str(e))

# GET /api/products?sort=price-asc
try:
    resp = session.get(f"{BASE_URL}/products?sort=price-asc")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        prices = [p.get("price", 0) for p in items]
        if prices == sorted(prices):
            log_pass("GET /api/products?sort=price-asc (ascending order)")
        else:
            log_fail("Sort price-asc", "Prices not in ascending order")
    else:
        log_fail("GET /api/products?sort=price-asc", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products?sort=price-asc", str(e))

# GET /api/products?sort=price-desc
try:
    resp = session.get(f"{BASE_URL}/products?sort=price-desc")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        prices = [p.get("price", 0) for p in items]
        if prices == sorted(prices, reverse=True):
            log_pass("GET /api/products?sort=price-desc (descending order)")
        else:
            log_fail("Sort price-desc", "Prices not in descending order")
    else:
        log_fail("GET /api/products?sort=price-desc", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products?sort=price-desc", str(e))

# GET /api/products?minPrice=500000&maxPrice=1000000
try:
    resp = session.get(f"{BASE_URL}/products?minPrice=500000&maxPrice=1000000")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if all(500000 <= p.get("price", 0) <= 1000000 for p in items):
            log_pass(f"GET /api/products?minPrice=500000&maxPrice=1000000 (filtered {len(items)} items)")
        else:
            log_fail("Price range filter", "Some items outside price range")
    else:
        log_fail("GET /api/products?minPrice=500000&maxPrice=1000000", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products?minPrice=500000&maxPrice=1000000", str(e))

# GET /api/products/featured
try:
    resp = session.get(f"{BASE_URL}/products/featured")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if all(p.get("featured") for p in items):
            log_pass(f"GET /api/products/featured (returned {len(items)} items)")
        else:
            log_fail("Featured products", "Some items not marked as featured")
    else:
        log_fail("GET /api/products/featured", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products/featured", str(e))

# GET /api/products/bestsellers
try:
    resp = session.get(f"{BASE_URL}/products/bestsellers")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if all(p.get("bestSeller") for p in items):
            log_pass(f"GET /api/products/bestsellers (returned {len(items)} items)")
        else:
            log_fail("Best sellers", "Some items not marked as bestSeller")
    else:
        log_fail("GET /api/products/bestsellers", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products/bestsellers", str(e))

# GET /api/products/new
try:
    resp = session.get(f"{BASE_URL}/products/new")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if all(p.get("newArrival") for p in items):
            log_pass(f"GET /api/products/new (returned {len(items)} items)")
        else:
            log_fail("New arrivals", "Some items not marked as newArrival")
    else:
        log_fail("GET /api/products/new", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products/new", str(e))

# GET /api/products/chronos-titanium (single product)
try:
    resp = session.get(f"{BASE_URL}/products/chronos-titanium")
    if resp.status_code == 200:
        data = resp.json()
        if "product" in data and "related" in data:
            log_pass("GET /api/products/chronos-titanium (product + related)")
        else:
            log_fail("Single product", "Missing product or related field")
    else:
        log_fail("GET /api/products/chronos-titanium", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products/chronos-titanium", str(e))

# GET /api/products/nonexistent-slug (should 404)
try:
    resp = session.get(f"{BASE_URL}/products/nonexistent-slug-12345")
    if resp.status_code == 404:
        log_pass("GET /api/products/nonexistent-slug (404 as expected)")
    else:
        log_fail("Nonexistent product", f"Expected 404, got {resp.status_code}")
except Exception as e:
    log_fail("GET /api/products/nonexistent-slug", str(e))

# ============================================================================
# 3. CATEGORIES / COLLECTIONS / TESTIMONIALS
# ============================================================================
print("\n[3] CATEGORIES / COLLECTIONS / TESTIMONIALS")
print("-" * 80)

try:
    resp = session.get(f"{BASE_URL}/categories")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if len(items) >= 6:
            log_pass(f"GET /api/categories (returned {len(items)} items)")
        else:
            log_warning("Categories", f"Expected 6 items, got {len(items)}")
    else:
        log_fail("GET /api/categories", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/categories", str(e))

try:
    resp = session.get(f"{BASE_URL}/collections")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if len(items) >= 3:
            log_pass(f"GET /api/collections (returned {len(items)} items)")
        else:
            log_warning("Collections", f"Expected 3 items, got {len(items)}")
    else:
        log_fail("GET /api/collections", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/collections", str(e))

try:
    resp = session.get(f"{BASE_URL}/testimonials")
    if resp.status_code == 200:
        items = resp.json().get("items", [])
        if len(items) >= 4:
            log_pass(f"GET /api/testimonials (returned {len(items)} items)")
        else:
            log_warning("Testimonials", f"Expected 4 items, got {len(items)}")
    else:
        log_fail("GET /api/testimonials", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/testimonials", str(e))

# ============================================================================
# 4. NEWSLETTER / CONTACT (PUBLIC)
# ============================================================================
print("\n[4] NEWSLETTER / CONTACT")
print("-" * 80)

# POST /api/newsletter with valid email
try:
    resp = session.post(f"{BASE_URL}/newsletter", json={"email": "test@example.com"})
    if resp.status_code == 200 and resp.json().get("ok"):
        log_pass("POST /api/newsletter (valid email)")
    else:
        log_fail("POST /api/newsletter", f"Status {resp.status_code}, body: {resp.text}")
except Exception as e:
    log_fail("POST /api/newsletter", str(e))

# POST /api/newsletter with empty body (should 400)
try:
    resp = session.post(f"{BASE_URL}/newsletter", json={})
    if resp.status_code == 400:
        log_pass("POST /api/newsletter (empty body -> 400)")
    else:
        log_warning("Newsletter validation", f"Expected 400, got {resp.status_code}")
except Exception as e:
    log_fail("POST /api/newsletter (empty)", str(e))

# POST /api/contact with full data
try:
    resp = session.post(f"{BASE_URL}/contact", json={
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Test Subject",
        "message": "Test message content"
    })
    if resp.status_code == 200 and resp.json().get("ok"):
        log_pass("POST /api/contact (valid data)")
    else:
        log_fail("POST /api/contact", f"Status {resp.status_code}, body: {resp.text}")
except Exception as e:
    log_fail("POST /api/contact", str(e))

# ============================================================================
# 5. AUTH (SUPABASE)
# ============================================================================
print("\n[5] AUTH (SUPABASE)")
print("-" * 80)

# GET /api/me without auth (should return {user: null})
try:
    resp = session.get(f"{BASE_URL}/me")
    if resp.status_code == 200:
        data = resp.json()
        if data.get("user") is None:
            log_pass("GET /api/me (no auth -> user: null)")
        else:
            log_warning("GET /api/me", f"Expected user: null, got {data}")
    else:
        log_fail("GET /api/me (no auth)", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/me (no auth)", str(e))

# POST /api/auth/signup
auth_success = False
try:
    resp = session.post(f"{BASE_URL}/auth/signup", json={
        "email": test_user_email,
        "password": test_user_password,
        "name": test_user_name
    })
    if resp.status_code == 200:
        data = resp.json()
        if "user" in data:
            if data.get("session"):
                log_pass("POST /api/auth/signup (user + session created)")
                auth_success = True
            else:
                log_warning("POST /api/auth/signup", "User created but no session (email confirmation may be required)")
        else:
            log_fail("POST /api/auth/signup", f"No user in response: {data}")
    else:
        log_fail("POST /api/auth/signup", f"Status {resp.status_code}, body: {resp.text}")
except Exception as e:
    log_fail("POST /api/auth/signup", str(e))

# POST /api/auth/login
if not auth_success:
    try:
        resp = session.post(f"{BASE_URL}/auth/login", json={
            "email": test_user_email,
            "password": test_user_password
        })
        if resp.status_code == 200:
            data = resp.json()
            if "user" in data:
                log_pass("POST /api/auth/login (successful)")
                auth_success = True
            else:
                log_fail("POST /api/auth/login", f"No user in response: {data}")
        else:
            # Email confirmation may be required
            log_warning("POST /api/auth/login", f"Status {resp.status_code} - Email confirmation may be required")
    except Exception as e:
        log_fail("POST /api/auth/login", str(e))

# GET /api/me after login (should return user object)
if auth_success:
    try:
        resp = session.get(f"{BASE_URL}/me")
        if resp.status_code == 200:
            data = resp.json()
            if data.get("user") and data["user"].get("email"):
                log_pass("GET /api/me (after auth -> user object)")
            else:
                log_fail("GET /api/me (after auth)", f"Expected user object, got {data}")
        else:
            log_fail("GET /api/me (after auth)", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("GET /api/me (after auth)", str(e))

# ============================================================================
# 6. CART (AUTHENTICATED)
# ============================================================================
print("\n[6] CART")
print("-" * 80)

# GET /api/cart without auth (should return empty items)
session_guest = requests.Session()
try:
    resp = session_guest.get(f"{BASE_URL}/cart")
    if resp.status_code == 200:
        data = resp.json()
        if data.get("items") == []:
            log_pass("GET /api/cart (no auth -> empty items)")
        else:
            log_warning("GET /api/cart (no auth)", f"Expected empty items, got {data}")
    else:
        log_fail("GET /api/cart (no auth)", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/cart (no auth)", str(e))

# If auth works, test cart operations
if auth_success:
    # POST /api/cart (add item)
    try:
        resp = session.post(f"{BASE_URL}/cart", json={
            "productId": "p001",
            "slug": "chronos-titanium",
            "name": "Chronos Titanium",
            "price": 485000,
            "image": "/images/chronos-titanium.jpg",
            "quantity": 1,
            "variant": {"dial": "black", "strap": "titanium"}
        })
        if resp.status_code == 200:
            data = resp.json()
            if len(data.get("items", [])) > 0:
                log_pass("POST /api/cart (add item)")
            else:
                log_fail("POST /api/cart", "No items in response")
        else:
            log_fail("POST /api/cart", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("POST /api/cart", str(e))
    
    # PUT /api/cart (update quantity)
    try:
        resp = session.put(f"{BASE_URL}/cart", json={
            "productId": "p001",
            "quantity": 2,
            "variant": {"dial": "black", "strap": "titanium"}
        })
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            if items and items[0].get("quantity") == 2:
                log_pass("PUT /api/cart (update quantity)")
            else:
                log_fail("PUT /api/cart", f"Quantity not updated: {items}")
        else:
            log_fail("PUT /api/cart", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("PUT /api/cart", str(e))
    
    # DELETE /api/cart (remove item)
    try:
        resp = session.delete(f"{BASE_URL}/cart", json={
            "productId": "p001",
            "variant": {"dial": "black", "strap": "titanium"}
        })
        if resp.status_code == 200:
            data = resp.json()
            if data.get("items") == []:
                log_pass("DELETE /api/cart (remove item)")
            else:
                log_warning("DELETE /api/cart", f"Expected empty cart, got {data}")
        else:
            log_fail("DELETE /api/cart", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("DELETE /api/cart", str(e))

# ============================================================================
# 7. WISHLIST (AUTHENTICATED)
# ============================================================================
print("\n[7] WISHLIST")
print("-" * 80)

# GET /api/wishlist without auth
try:
    resp = session_guest.get(f"{BASE_URL}/wishlist")
    if resp.status_code == 200:
        data = resp.json()
        if data.get("items") == []:
            log_pass("GET /api/wishlist (no auth -> empty items)")
        else:
            log_warning("GET /api/wishlist (no auth)", f"Expected empty items, got {data}")
    else:
        log_fail("GET /api/wishlist (no auth)", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/wishlist (no auth)", str(e))

if auth_success:
    # POST /api/wishlist (add product)
    try:
        resp = session.post(f"{BASE_URL}/wishlist", json={
            "productId": "p002",
            "slug": "heritage-gold",
            "name": "Heritage Gold",
            "price": 750000,
            "image": "/images/heritage-gold.jpg"
        })
        if resp.status_code == 200:
            data = resp.json()
            if len(data.get("items", [])) > 0:
                log_pass("POST /api/wishlist (add product)")
            else:
                log_fail("POST /api/wishlist", "No items in response")
        else:
            log_fail("POST /api/wishlist", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("POST /api/wishlist", str(e))
    
    # DELETE /api/wishlist (remove product)
    try:
        resp = session.delete(f"{BASE_URL}/wishlist", json={"productId": "p002"})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("items") == []:
                log_pass("DELETE /api/wishlist (remove product)")
            else:
                log_warning("DELETE /api/wishlist", f"Expected empty wishlist, got {data}")
        else:
            log_fail("DELETE /api/wishlist", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("DELETE /api/wishlist", str(e))

# ============================================================================
# 8. ORDERS (AUTHENTICATED)
# ============================================================================
print("\n[8] ORDERS")
print("-" * 80)

# POST /api/orders without auth (should 401)
try:
    resp = session_guest.post(f"{BASE_URL}/orders", json={
        "items": [],
        "shipping": {},
        "subtotal": 0,
        "total": 0
    })
    if resp.status_code == 401:
        log_pass("POST /api/orders (no auth -> 401)")
    else:
        log_warning("POST /api/orders (no auth)", f"Expected 401, got {resp.status_code}")
except Exception as e:
    log_fail("POST /api/orders (no auth)", str(e))

if auth_success:
    # POST /api/orders (create order)
    try:
        resp = session.post(f"{BASE_URL}/orders", json={
            "items": [{
                "productId": "p001",
                "name": "Chronos Titanium",
                "price": 485000,
                "quantity": 1
            }],
            "shipping": {
                "name": "Test User",
                "address": "123 Test St",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "phone": "9876543210"
            },
            "subtotal": 485000,
            "shippingCost": 0,
            "tax": 14550,
            "total": 499550,
            "paymentMethod": "cod"
        })
        if resp.status_code == 200:
            data = resp.json()
            if "order" in data and data["order"].get("orderId"):
                log_pass(f"POST /api/orders (created order {data['order']['orderId']})")
            else:
                log_fail("POST /api/orders", f"No orderId in response: {data}")
        else:
            log_fail("POST /api/orders", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("POST /api/orders", str(e))
    
    # GET /api/orders (list user orders)
    try:
        resp = session.get(f"{BASE_URL}/orders")
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            if len(items) > 0:
                log_pass(f"GET /api/orders (returned {len(items)} orders)")
            else:
                log_warning("GET /api/orders", "No orders found")
        else:
            log_fail("GET /api/orders", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("GET /api/orders", str(e))

# GET /api/orders without auth
try:
    resp = session_guest.get(f"{BASE_URL}/orders")
    if resp.status_code == 200:
        data = resp.json()
        if data.get("items") == []:
            log_pass("GET /api/orders (no auth -> empty items)")
        else:
            log_warning("GET /api/orders (no auth)", f"Expected empty items, got {data}")
    else:
        log_fail("GET /api/orders (no auth)", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/orders (no auth)", str(e))

# ============================================================================
# 9. REVIEWS
# ============================================================================
print("\n[9] REVIEWS")
print("-" * 80)

# GET /api/reviews/chronos-titanium (should return empty initially)
try:
    resp = session.get(f"{BASE_URL}/reviews/chronos-titanium")
    if resp.status_code == 200:
        data = resp.json()
        log_pass(f"GET /api/reviews/chronos-titanium (returned {len(data.get('items', []))} reviews)")
    else:
        log_fail("GET /api/reviews/chronos-titanium", f"Status {resp.status_code}")
except Exception as e:
    log_fail("GET /api/reviews/chronos-titanium", str(e))

# POST /api/reviews without auth (should 401)
try:
    resp = session_guest.post(f"{BASE_URL}/reviews", json={
        "productSlug": "chronos-titanium",
        "rating": 5,
        "title": "Excellent watch",
        "comment": "Best purchase ever!"
    })
    if resp.status_code == 401:
        log_pass("POST /api/reviews (no auth -> 401)")
    else:
        log_warning("POST /api/reviews (no auth)", f"Expected 401, got {resp.status_code}")
except Exception as e:
    log_fail("POST /api/reviews (no auth)", str(e))

if auth_success:
    # POST /api/reviews (add review)
    try:
        resp = session.post(f"{BASE_URL}/reviews", json={
            "productSlug": "chronos-titanium",
            "rating": 5,
            "title": "Excellent watch",
            "comment": "Best purchase ever! The craftsmanship is outstanding."
        })
        if resp.status_code == 200:
            data = resp.json()
            if "review" in data:
                log_pass("POST /api/reviews (review created)")
            else:
                log_fail("POST /api/reviews", f"No review in response: {data}")
        else:
            log_fail("POST /api/reviews", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("POST /api/reviews", str(e))

# ============================================================================
# 10. ADMIN (GATED)
# ============================================================================
print("\n[10] ADMIN ENDPOINTS")
print("-" * 80)

# GET /api/admin/stats without auth (should 403)
try:
    resp = session_guest.get(f"{BASE_URL}/admin/stats")
    if resp.status_code == 403:
        log_pass("GET /api/admin/stats (no auth -> 403)")
    else:
        log_warning("GET /api/admin/stats (no auth)", f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_fail("GET /api/admin/stats (no auth)", str(e))

# GET /api/admin/products without auth (should 403)
try:
    resp = session_guest.get(f"{BASE_URL}/admin/products")
    if resp.status_code == 403:
        log_pass("GET /api/admin/products (no auth -> 403)")
    else:
        log_warning("GET /api/admin/products (no auth)", f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_fail("GET /api/admin/products (no auth)", str(e))

# GET /api/admin/orders without auth (should 403)
try:
    resp = session_guest.get(f"{BASE_URL}/admin/orders")
    if resp.status_code == 403:
        log_pass("GET /api/admin/orders (no auth -> 403)")
    else:
        log_warning("GET /api/admin/orders (no auth)", f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_fail("GET /api/admin/orders (no auth)", str(e))

# Note: Testing with admin credentials would require either:
# 1. Creating a user with email admin@auverra.com
# 2. Using Supabase admin API to set user_metadata.role='admin'
# This is beyond the scope of basic API testing

# ============================================================================
# 11. LOGOUT
# ============================================================================
print("\n[11] LOGOUT")
print("-" * 80)

if auth_success:
    try:
        resp = session.post(f"{BASE_URL}/auth/logout")
        if resp.status_code == 200 and resp.json().get("ok"):
            log_pass("POST /api/auth/logout")
        else:
            log_fail("POST /api/auth/logout", f"Status {resp.status_code}")
    except Exception as e:
        log_fail("POST /api/auth/logout", str(e))

# ============================================================================
# SUMMARY
# ============================================================================
print_summary()
