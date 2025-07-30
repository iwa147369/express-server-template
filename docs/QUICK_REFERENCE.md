# ⚡ Quick Reference Card

Essential endpoints and commands for the Retail Management API.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository>
cd retail_management
npm install

# Start server
npm start
# Server runs on http://localhost:3000

# Health check
curl http://localhost:3000/api/health

# Run tests
npm test
```

## 🔗 Essential Endpoints

### Core System
```
GET  /api/health           # System status
GET  /api/info             # API information
```

### Products (Inventory Management)
```
GET    /api/products              # List all products
GET    /api/products/id/{id}      # Get specific product
GET    /api/products/filter       # Search/filter products
GET    /api/products/low-stock    # Low stock alerts
POST   /api/products              # Create product
PUT    /api/products/{id}         # Update product
PATCH  /api/products/{id}/stock   # Update stock only
DELETE /api/products/{id}         # Delete product
```

### Orders (Order Management)
```
GET    /api/orders                   # List all orders
GET    /api/orders/id/{orderId}      # Get specific order
GET    /api/orders/filter            # Search/filter orders
POST   /api/orders                  # Create order
PUT    /api/orders/OrderID/{id}     # Update order
DELETE /api/orders/OrderID/{id}     # Delete order
```

### Order Details (Line Items)
```
GET    /api/order-details              # List all order details
GET    /api/order-details/order/{id}   # Get details for order
POST   /api/order-details              # Add order detail
PUT    /api/order-details/Order ID/{id} # Update order detail
DELETE /api/order-details/Order ID/{id} # Delete order detail
```

### Transactions (Financial Records)
```
GET    /api/transactions               # List all transactions
GET    /api/transactions/id/{id}       # Get specific transaction
GET    /api/transactions/filter        # Search/filter transactions
GET    /api/transactions/summary       # Analytics & summary
POST   /api/transactions              # Create transaction
PUT    /api/transactions/{id}         # Update transaction
PATCH  /api/transactions/{id}/confirm # Confirm transaction
DELETE /api/transactions/{id}         # Delete transaction
```

### Batches (Inventory Batches)
```
GET    /api/batches                    # List all batches
GET    /api/batches/id/{id}            # Get specific batch
GET    /api/batches/product/{id}       # Get batches for product
GET    /api/batches/inventory-summary  # Inventory analytics
GET    /api/batches/filter             # Search/filter batches
POST   /api/batches                   # Create batch
PUT    /api/batches/{id}              # Update batch
PATCH  /api/batches/{id}/quantity     # Update quantity only
DELETE /api/batches/{id}              # Delete batch
```

## 📋 Common Query Parameters

```
?page=1&limit=50          # Pagination
?range=A1:E100           # Custom range
?search=keyword          # Search term
?minStock=10&maxStock=100 # Stock filters
?minPrice=50&maxPrice=500 # Price filters
?date_from=2025-01-01    # Date range start
?date_to=2025-12-31      # Date range end
?category=Sale           # Filter by category
?confirmed=true          # Filter confirmed items
```

## 🔧 Quick Code Snippets

### JavaScript/Axios
```javascript
// Get all products
const products = await axios.get('/api/products');

// Create product
const product = await axios.post('/api/products', {
    'Product ID': 'PROD001',
    'Product Name': 'Test Product',
    'Selling Price': 99.99,
    'Current Stock': 50,
    'Min Stock': 10
});

// Update stock
await axios.patch('/api/products/PROD001/stock', {
    adjustment: -5  // Decrease by 5
});

// Filter orders
const orders = await axios.get('/api/orders/filter', {
    params: { channel: 'Online', process: 'Pending' }
});
```

### cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"OrderID":"ORD001","Order Date":"2025-07-30","Channel":"Online","Platform":"Website","Username":"customer","Recipient":"John Doe","Phone Number":"123-456-7890","Address":"123 Main St"}'

# Get low stock products
curl http://localhost:3000/api/products/low-stock

# Transaction summary
curl http://localhost:3000/api/transactions/summary
```

### Python/Requests
```python
import requests

base_url = "http://localhost:3000/api"

# Get products
response = requests.get(f"{base_url}/products")
products = response.json()

# Create transaction
transaction_data = {
    "Transaction ID": "TXN001",
    "Date": "2025-07-30",
    "Category": "Sale",
    "Amount": 299.99,
    "Confirmed": True
}
response = requests.post(f"{base_url}/transactions", json=transaction_data)
```

## 📊 Response Format

### Success Response
```json
{
    "success": true,
    "data": [...],
    "count": 10,
    "message": "Operation completed"
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error description",
    "details": {...}
}
```

## 🏗️ Data Models

### Product
```json
{
    "Product ID": "string",
    "Product Name": "string", 
    "Selling Price": "number",
    "Current Stock": "number",
    "Min Stock": "number"
}
```

### Order
```json
{
    "OrderID": "string",
    "Order Date": "string",
    "Channel": "string",
    "Platform": "string",
    "Username": "string",
    "Recipient": "string",
    "Phone Number": "string", 
    "Address": "string",
    "Process": "string"
}
```

### Transaction
```json
{
    "Transaction ID": "string",
    "Date": "string",
    "Category": "string",
    "Amount": "number",
    "From": "string",
    "To": "string",
    "Confirmed": "boolean",
    "Note": "string"
}
```

### Batch
```json
{
    "Batch ID": "string",
    "Product ID": "string",
    "Unit Cost Price": "number",
    "Quantity": "number",
    "Import Date": "string"
}
```

## 🎯 Common Use Cases

### Inventory Management
```javascript
// Check low stock
const lowStock = await axios.get('/api/products/low-stock');

// Update stock after sale
await axios.patch('/api/products/PROD001/stock', {
    adjustment: -2  // Sold 2 units
});

// Add new inventory batch
await axios.post('/api/batches', {
    'Batch ID': 'BATCH001',
    'Product ID': 'PROD001', 
    'Unit Cost Price': 150.00,
    'Quantity': 50,
    'Import Date': '2025-07-30'
});
```

### Order Processing
```javascript
// Create order with details
const order = await axios.post('/api/orders', orderData);
const orderDetail = await axios.post('/api/order-details', {
    'Order ID': order.data.data.OrderID,
    'Product ID': 'PROD001',
    'Selling Price': 299.99,
    'Total Selling Price': 299.99
});

// Update order status
await axios.put(`/api/orders/OrderID/${orderId}`, {
    Process: 'Shipped'
});
```

### Financial Tracking
```javascript
// Record sale transaction
await axios.post('/api/transactions', {
    'Transaction ID': 'TXN001',
    'Date': '2025-07-30',
    'Category': 'Sale',
    'Amount': 299.99,
    'Confirmed': true
});

// Get financial summary
const summary = await axios.get('/api/transactions/summary');
console.log(`Revenue: $${summary.data.data.total_revenue}`);
```

## 🚨 Error Handling

```javascript
try {
    const response = await axios.post('/api/products', productData);
    console.log('Success:', response.data);
} catch (error) {
    if (error.response?.status === 409) {
        console.log('Product already exists');
    } else if (error.response?.status === 400) {
        console.log('Invalid data:', error.response.data.error);
    } else {
        console.log('Server error:', error.message);
    }
}
```

## 📈 Performance Tips

- Use pagination for large datasets: `?page=1&limit=50`
- Filter data server-side instead of client-side
- Cache frequently accessed data
- Use specific endpoints (e.g., `/products/id/{id}`) instead of filtering all data
- Batch operations when possible
- Monitor response times with `/api/health`

## 🔍 Testing

```bash
# Run all tests
npm test

# Run specific test
node tests/comprehensive-test.js

# Performance test
node tests/performance-test.js
```

## 📞 Support

- **Documentation**: See `/docs/` folder
- **API Reference**: `/docs/API_REFERENCE.md`
- **Frontend Guide**: `/docs/FRONTEND_GUIDE.md`
- **Test Examples**: `/tests/` folder

---

**Base URL**: `http://localhost:3000/api`
**Content-Type**: `application/json`
**Current Version**: `1.0.0`
