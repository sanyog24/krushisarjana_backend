# Krushi Sarjana Backend API Documentation

**Base URL:** `https://krushisarjana-backend.vercel.app/api`

**Status:** ✅ Deployed and Accessible

---

## 📋 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Farmer APIs](#farmer-apis)
3. [Customer APIs](#customer-apis)
4. [Retailer APIs](#retailer-apis)
5. [Product APIs](#product-apis)
6. [Order APIs](#order-apis)
7. [Review APIs](#review-apis)
8. [Health Check](#health-check)

---

## 🔐 Authentication APIs

### Base Path: `/api/auth`

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Farmer" // or "Customer", "Retailer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Farmer"
  },
  "token": "jwt_token_here"
}
```

---

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Farmer"
  },
  "token": "jwt_token_here"
}
```

---

#### 3. Logout User
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 4. Get User by ID
```http
GET /api/auth/user/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Farmer"
  }
}
```

---

## 👨‍🌾 Farmer APIs

### Base Path: `/api/farmers`

#### 1. Create/Update Farmer Profile
```http
POST /api/farmers/upsert-farmer
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "name": "John Farmer",
  "phone": "1234567890",
  "address": {
    "street": "123 Farm Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "profileImage": <file> // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Farmer profile updated successfully",
  "farmer": {
    "_id": "farmerId",
    "userId": "userId",
    "name": "John Farmer",
    "phone": "1234567890",
    "address": {...},
    "profileUrl": "cloudinary_url"
  }
}
```

---

#### 2. Get Authenticated Farmer Details
```http
GET /api/farmers/get-farmer
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "farmer": {
    "_id": "farmerId",
    "userId": "userId",
    "name": "John Farmer",
    "phone": "1234567890",
    "address": {...},
    "profileUrl": "cloudinary_url"
  }
}
```

---

#### 3. Get Farmer by ID (Public)
```http
GET /api/farmers/get-farmer/:farmerId
```

**Response:**
```json
{
  "success": true,
  "farmer": {
    "_id": "farmerId",
    "name": "John Farmer",
    "phone": "1234567890",
    "profileUrl": "cloudinary_url"
  }
}
```

---

## 👥 Customer APIs

### Base Path: `/api/customers`

#### 1. Create/Update Customer Profile
```http
POST /api/customers/upsert
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "name": "Jane Customer",
  "phone": "9876543210",
  "address": {...},
  "profileImage": <file> // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer profile updated successfully",
  "customer": {
    "_id": "customerId",
    "userId": "userId",
    "name": "Jane Customer",
    "profileUrl": "cloudinary_url"
  }
}
```

---

#### 2. Get Customer Details
```http
GET /api/customers/customer-details
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "customer": {
    "_id": "customerId",
    "userId": "userId",
    "name": "Jane Customer",
    "phone": "9876543210",
    "address": {...}
  }
}
```

---

## 🏪 Retailer APIs

### Base Path: `/api/retailers`

#### 1. Get Retailer Profile
```http
GET /api/retailers/get-profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "retailer": {
    "_id": "retailerId",
    "userId": "userId",
    "name": "Retailer Name",
    "shopName": "Shop Name",
    "profileUrl": "cloudinary_url"
  }
}
```

---

#### 2. Create/Update Retailer Profile
```http
POST /api/retailers/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "name": "Retailer Name",
  "shopName": "My Shop",
  "phone": "1234567890",
  "address": {...},
  "profileImage": <file> // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Retailer profile updated successfully",
  "retailer": {...}
}
```

---

## 🛒 Product APIs

### Base Path: `/api/products`

#### 1. Add Product (Farmer/Retailer Only)
```http
POST /api/products/add-product
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "name": "Fresh Tomatoes",
  "category": "Vegetables",
  "price": 50,
  "quantity": 100,
  "unit": "kg",
  "description": "Fresh organic tomatoes",
  "productImage": <file>
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added successfully",
  "product": {
    "_id": "productId",
    "name": "Fresh Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "quantity": 100,
    "image": "cloudinary_url",
    "seller": "userId"
  }
}
```

---

#### 2. Get All Products (Public)
```http
GET /api/products/all-products
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "productId",
      "name": "Fresh Tomatoes",
      "category": "Vegetables",
      "price": 50,
      "quantity": 100,
      "image": "cloudinary_url",
      "seller": {...}
    }
  ]
}
```

---

#### 3. Get Products by Category
```http
GET /api/products/category/:category
```

**Example:**
```http
GET /api/products/category/Vegetables
```

**Response:**
```json
{
  "success": true,
  "products": [...]
}
```

---

#### 4. Get Product by ID
```http
GET /api/products/product/:productId
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "productId",
    "name": "Fresh Tomatoes",
    "category": "Vegetables",
    "price": 50,
    "quantity": 100,
    "image": "cloudinary_url",
    "seller": {...},
    "reviews": [...]
  }
}
```

---

#### 5. Get Products by Name
```http
GET /api/products/name/:productName
```

**Example:**
```http
GET /api/products/name/tomato
```

**Response:**
```json
{
  "success": true,
  "products": [...]
}
```

---

#### 6. Get My Products (Farmer/Retailer Only)
```http
GET /api/products/my-products
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "products": [...]
}
```

---

#### 7. Edit Product
```http
PUT /api/products/edit-product/:productId
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "name": "Updated Product Name",
  "price": 60,
  "quantity": 150,
  "productImage": <file> // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {...}
}
```

---

#### 8. Delete Product
```http
DELETE /api/products/remove-product/:productId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 📦 Order APIs

### Base Path: `/api/orders`

#### 1. Create Order
```http
POST /api/orders/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "buyerId": "userId",
  "productId": "productId",
  "paymentId": "PAY_STRIPE_123456",
  "subTotalAmount": 500,
  "totalAmount": 550,
  "shippingAddress": "123 Main Street, Mumbai",
  "paymentMethod": "Stripe" // or "Coins"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "orderId",
    "buyerId": "userId",
    "productId": "productId",
    "totalAmount": 550,
    "paymentStatus": "Paid",
    "orderStatus": "Pending"
  }
}
```

---

#### 2. Get User Orders
```http
GET /api/orders/:userId
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "orderId",
      "product": {...},
      "totalAmount": 550,
      "orderStatus": "Pending",
      "createdAt": "2026-04-25T10:00:00.000Z"
    }
  ]
}
```

---

#### 3. Update Order Status
```http
PUT /api/orders/:orderId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Shipped" // or "Delivered", "Cancelled"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {...}
}
```

---

#### 4. Cancel Order
```http
DELETE /api/orders/:orderId/cancel
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

#### 5. Create Stripe Checkout Session
```http
POST /api/orders/checkout
Content-Type: application/json

{
  "items": [
    {
      "name": "Fresh Tomatoes",
      "price": 50,
      "quantity": 10,
      "image": "product_image_url"
    }
  ],
  "userId": "userId"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "stripe_session_id"
}
```

---

#### 6. Create Payment Intent
```http
POST /api/orders/payment-intent
Content-Type: application/json

{
  "amount": 5000 // Amount in paise (₹50.00)
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "stripe_client_secret"
}
```

---

## ⭐ Review APIs

### Base Path: `/api/products/:productId`

#### 1. Add Review
```http
POST /api/products/:productId/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent product!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review added successfully",
  "review": {
    "_id": "reviewId",
    "userId": "userId",
    "rating": 5,
    "comment": "Excellent product!",
    "createdAt": "2026-04-25T10:00:00.000Z"
  }
}
```

---

#### 2. Get Product Reviews
```http
GET /api/products/:productId/reviews
```

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "reviewId",
      "user": {
        "name": "John Doe",
        "profileUrl": "..."
      },
      "rating": 5,
      "comment": "Excellent product!",
      "createdAt": "2026-04-25T10:00:00.000Z"
    }
  ]
}
```

---

#### 3. Delete Review
```http
DELETE /api/products/:productId/review/:reviewId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## 🏥 Health Check

### Check API Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "dbState": 1,
  "timestamp": "2026-04-25T10:00:00.000Z"
}
```

---

### Check Root Endpoint
```http
GET /
```

**Response:**
```json
{
  "message": "Krushi Sarjana Backend API",
  "status": "healthy",
  "timestamp": "2026-04-25T10:00:00.000Z",
  "dbStatus": "connected",
  "dbState": 1,
  "env": "production",
  "mongoUriConfigured": true
}
```

---

## 🔑 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer {your_jwt_token}
```

---

## 🚀 Deployment Information

- **Platform:** Vercel
- **URL:** https://krushisarjana-backend.vercel.app
- **Database:** MongoDB Atlas
- **File Storage:** Cloudinary
- **Payment Gateway:** Stripe

---

## 📝 Notes

1. **Image Uploads:** Use `multipart/form-data` for endpoints that accept images
2. **Role-Based Access:** Some endpoints require specific roles (Farmer, Retailer, Customer)
3. **CORS:** Configured to allow requests from mobile apps and frontend
4. **Rate Limiting:** Consider implementing rate limiting for production use
5. **Error Handling:** All endpoints return consistent error responses with appropriate HTTP status codes

---

## 🐛 Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📞 Support

For issues or questions, please contact the development team.
