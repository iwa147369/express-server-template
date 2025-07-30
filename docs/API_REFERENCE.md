# 📚 API Reference

Complete reference documentation for the Retail Management API endpoints.

## 🌐 Base URL

```
http://localhost:3000/api
```

## 📋 Response Format

All API responses follow this standard format:

### Success Response
```json
{
    "success": true,
    "data": [...],
    "count": 10,
    "message": "Operation completed successfully"
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error message description",
    "details": {...}
}
```

## 🏥 System Endpoints

### Health Check
Check API server status and Google Sheets connectivity.

**GET** `/health`

**Response:**
```json
{
    "success": true,
    "message": "API is healthy",
    "timestamp": "2025-07-30T15:33:32.440Z",
    "google_sheets": {
        "connected": true,
        "spreadsheet_title": "Retail_Management_System",
        "available_sheets": [
            "Orders",
            "Order Details", 
            "Products",
            "Transactions",
            "Batches"
        ]
    }
}
```

### API Information
Get API metadata and available endpoints.

**GET** `/info`

**Response:**
```json
{
    "success": true,
    "api": {
        "name": "Google Sheets Retail Management API",
        "version": "1.0.0",
        "description": "Complete retail management system",
        "endpoints": {
            "products": "Product management operations",
            "orders": "Order management operations",
            "transactions": "Transaction management operations",
            "batches": "Batch inventory management",
            "order_details": "Order details management"
        }
    }
}
```

## 📦 Products API

### Get All Products
Retrieve all products with optional pagination.

**GET** `/products`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 100)
- `range` (string): Custom range (e.g., "A1:E50")

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "Product ID": "PROD001",
            "Product Name": "Sample Product",
            "Selling Price": "299.99",
            "Current Stock": "50",
            "Min Stock": "10"
        }
    ],
    "headers": ["Product ID", "Product Name", "Selling Price", "Current Stock", "Min Stock"],
    "count": 1
}
```

### Get Product by ID
Retrieve a specific product by its ID.

**GET** `/products/id/{productId}`

**Parameters:**
- `productId` (string): Unique product identifier

**Response:**
```json
{
    "success": true,
    "data": {
        "Product ID": "PROD001",
        "Product Name": "Sample Product",
        "Selling Price": "299.99",
        "Current Stock": "50",
        "Min Stock": "10"
    },
    "rowIndex": 2
}
```

### Filter Products
Search and filter products by various criteria.

**GET** `/products/filter`

**Query Parameters:**
- `minStock` (number): Minimum stock level
- `maxStock` (number): Maximum stock level
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `search` (string): Search in product name/ID

**Response:**
```json
{
    "success": true,
    "data": [...],
    "count": 5,
    "filters_applied": {
        "minStock": "10",
        "maxStock": "100"
    }
}
```

### Get Low Stock Products
Retrieve products with stock at or below minimum threshold.

**GET** `/products/low-stock`

**Response:**
```json
{
    "success": true,
    "data": [...],
    "count": 3,
    "message": "Products with low stock"
}
```

### Create Product
Add a new product to inventory.

**POST** `/products`

**Request Body:**
```json
{
    "Product ID": "PROD002",
    "Product Name": "New Product",
    "Selling Price": 199.99,
    "Current Stock": 25,
    "Min Stock": 5
}
```

**Response:**
```json
{
    "success": true,
    "message": "Product created successfully",
    "data": {
        "Product ID": "PROD002",
        "Product Name": "New Product",
        "Selling Price": 199.99,
        "Current Stock": 25,
        "Min Stock": 5
    },
    "sheets_response": {...}
}
```

### Update Product
Update an existing product.

**PUT** `/products/{productId}`

**Request Body:**
```json
{
    "Selling Price": 249.99,
    "Current Stock": 30
}
```

**Response:**
```json
{
    "success": true,
    "message": "Product updated successfully",
    "data": {...},
    "sheets_response": {...}
}
```

### Update Product Stock
Update only the stock quantity of a product.

**PATCH** `/products/{productId}/stock`

**Request Body:**
```json
{
    "current_stock": 45
}
```
**OR**
```json
{
    "adjustment": -5
}
```

**Response:**
```json
{
    "success": true,
    "message": "Product stock updated successfully",
    "data": {...},
    "previous_stock": "50",
    "new_stock": 45,
    "sheets_response": {...}
}
```

### Delete Product
Remove a product from inventory.

**DELETE** `/products/{productId}`

**Response:**
```json
{
    "success": true,
    "message": "Product deleted successfully",
    "deleted_product": {...},
    "sheets_response": {...}
}
```

## 🛒 Orders API

### Get All Orders
Retrieve all orders with optional pagination.

**GET** `/orders`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `range` (string): Custom range

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "OrderID": "ORD001",
            "Order Date": "2025-07-30",
            "Channel": "Online",
            "Remark": "Test order",
            "Platform": "Website",
            "Username": "customer1",
            "Recipient": "John Doe",
            "Phone Number": "123-456-7890",
            "Address": "123 Main St",
            "Process": "Pending"
        }
    ],
    "headers": [...],
    "count": 1
}
```

### Get Order by ID
Retrieve a specific order by OrderID.

**GET** `/orders/id/{orderId}`

**Response:**
```json
{
    "success": true,
    "data": {
        "OrderID": "ORD001",
        "Order Date": "2025-07-30",
        "Channel": "Online",
        ...
    },
    "rowIndex": 2
}
```

### Filter Orders
Search and filter orders by various criteria.

**GET** `/orders/filter`

**Query Parameters:**
- `channel` (string): Filter by sales channel
- `platform` (string): Filter by platform
- `process` (string): Filter by order status
- `date_from` (string): Start date (YYYY-MM-DD)
- `date_to` (string): End date (YYYY-MM-DD)

### Create Order
Create a new order.

**POST** `/orders`

**Request Body:**
```json
{
    "OrderID": "ORD002",
    "Order Date": "2025-07-30",
    "Channel": "Online",
    "Remark": "Customer order",
    "Platform": "Website",
    "Username": "customer2",
    "Recipient": "Jane Smith",
    "Phone Number": "987-654-3210",
    "Address": "456 Oak Ave",
    "Process": "Processing"
}
```

### Update Order
Update an existing order.

**PUT** `/orders/OrderID/{orderId}`

**Request Body:**
```json
{
    "Process": "Shipped",
    "Remark": "Order shipped via FedEx"
}
```

### Delete Order
Remove an order.

**DELETE** `/orders/OrderID/{orderId}`

## 📋 Order Details API

### Get All Order Details
Retrieve all order details.

**GET** `/order-details`

### Get Order Details by Order ID
Get all details for a specific order.

**GET** `/order-details/order/{orderId}`

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "Order ID": "ORD001",
            "Product ID": "PROD001",
            "Selling Price": "299.99",
            "Total Selling Price": "599.98",
            "Size": "L",
            "Color": "Blue",
            "Batch ID": "BATCH001"
        }
    ],
    "count": 1
}
```

### Create Order Detail
Add a line item to an order.

**POST** `/order-details`

**Request Body:**
```json
{
    "Order ID": "ORD001",
    "Product ID": "PROD001", 
    "Selling Price": 299.99,
    "Total Selling Price": 599.98,
    "Size": "L",
    "Color": "Blue",
    "Batch ID": "BATCH001"
}
```

### Update Order Detail
Update an existing order detail.

**PUT** `/order-details/Order ID/{orderId}`

### Delete Order Detail
Remove an order detail.

**DELETE** `/order-details/Order ID/{orderId}`

## 💰 Transactions API

### Get All Transactions
Retrieve all transactions.

**GET** `/transactions`

### Get Transaction by ID
Retrieve a specific transaction.

**GET** `/transactions/id/{transactionId}`

**Response:**
```json
{
    "success": true,
    "data": {
        "Transaction ID": "TXN001",
        "Date": "2025-07-30",
        "Category": "Sale",
        "Amount": "299.99",
        "From": "Customer",
        "To": "Revenue",
        "Confirmed": "true",
        "Note": "Product sale"
    },
    "rowIndex": 1
}
```

### Get Transaction Summary
Get analytics and summary data for transactions.

**GET** `/transactions/summary`

**Response:**
```json
{
    "success": true,
    "data": {
        "total_transactions": 150,
        "confirmed_transactions": 145,
        "pending_transactions": 5,
        "total_revenue": 45000.00,
        "total_expenses": 32000.00,
        "net_profit": 13000.00,
        "by_category": {
            "Sale": 120,
            "Purchase": 20,
            "Refund": 5,
            "Expense": 5
        },
        "monthly_summary": [...]
    }
}
```

### Filter Transactions
Search and filter transactions.

**GET** `/transactions/filter`

**Query Parameters:**
- `category` (string): Filter by transaction category
- `confirmed` (boolean): Filter by confirmation status
- `min_amount` (number): Minimum amount
- `max_amount` (number): Maximum amount
- `date_from` (string): Start date
- `date_to` (string): End date

### Create Transaction
Record a new transaction.

**POST** `/transactions`

**Request Body:**
```json
{
    "Transaction ID": "TXN002",
    "Date": "2025-07-30",
    "Category": "Purchase",
    "Amount": -150.00,
    "From": "Supplier",
    "To": "Inventory",
    "Confirmed": false,
    "Note": "Inventory purchase"
}
```

### Update Transaction
Update an existing transaction.

**PUT** `/transactions/{transactionId}`

### Confirm Transaction
Confirm or unconfirm a transaction.

**PATCH** `/transactions/{transactionId}/confirm`

**Request Body:**
```json
{
    "confirmed": true
}
```

### Delete Transaction
Remove a transaction.

**DELETE** `/transactions/{transactionId}`

## 📦 Batches API

### Get All Batches
Retrieve all inventory batches.

**GET** `/batches`

### Get Batch by ID
Retrieve a specific batch.

**GET** `/batches/id/{batchId}`

**Response:**
```json
{
    "success": true,
    "data": {
        "Batch ID": "BATCH001",
        "Product ID": "PROD001",
        "Unit Cost Price": "150.00",
        "Quantity": "50",
        "Import Date": "2025-07-30"
    },
    "rowIndex": 1
}
```

### Get Batches by Product ID
Get all batches for a specific product.

**GET** `/batches/product/{productId}`

**Response:**
```json
{
    "success": true,
    "data": [...],
    "count": 3,
    "summary": {
        "product_id": "PROD001",
        "total_quantity": 150,
        "average_unit_cost": 145.50,
        "total_batches": 3
    }
}
```

### Get Batch Inventory Summary
Get comprehensive inventory summary.

**GET** `/batches/inventory-summary`

**Query Parameters:**
- `product_id` (string): Filter by specific product

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "product_id": "PROD001",
            "total_quantity": 150,
            "total_batches": 3,
            "average_cost": 145.50,
            "total_cost_value": 21825.00,
            "batches": [...]
        }
    ],
    "total_products": 5,
    "overall_summary": {
        "total_batches": 15,
        "total_quantity": 750,
        "total_value": 125000.00
    }
}
```

### Filter Batches
Search and filter batches.

**GET** `/batches/filter`

**Query Parameters:**
- `product_id` (string): Filter by product
- `min_cost` (number): Minimum unit cost
- `max_cost` (number): Maximum unit cost
- `min_quantity` (number): Minimum quantity
- `max_quantity` (number): Maximum quantity
- `import_date_from` (string): Start date
- `import_date_to` (string): End date

### Create Batch
Add a new inventory batch.

**POST** `/batches`

**Request Body:**
```json
{
    "Batch ID": "BATCH002",
    "Product ID": "PROD001",
    "Unit Cost Price": 140.00,
    "Quantity": 25,
    "Import Date": "2025-07-30"
}
```

### Update Batch
Update an existing batch.

**PUT** `/batches/{batchId}`

### Update Batch Quantity
Update only the quantity of a batch.

**PATCH** `/batches/{batchId}/quantity`

**Request Body:**
```json
{
    "quantity": 30
}
```
**OR**
```json
{
    "adjustment": -5
}
```

**Response:**
```json
{
    "success": true,
    "message": "Batch quantity updated successfully",
    "data": {...},
    "previous_quantity": "25",
    "new_quantity": 20,
    "sheets_response": {...}
}
```

### Delete Batch
Remove a batch from inventory.

**DELETE** `/batches/{batchId}`

## 🚫 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid data |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

## 📝 Data Validation

### Product Validation
```javascript
{
    'Product ID': 'string, required',
    'Product Name': 'string, required',
    'Selling Price': 'number, positive, required',
    'Current Stock': 'integer, min 0, required',
    'Min Stock': 'integer, min 0, required'
}
```

### Order Validation
```javascript
{
    'OrderID': 'string, required',
    'Order Date': 'string, required',
    'Channel': 'string, required',
    'Remark': 'string, optional',
    'Platform': 'string, required',
    'Username': 'string, required',
    'Recipient': 'string, required',
    'Phone Number': 'string, required',
    'Address': 'string, required',
    'Process': 'string, optional'
}
```

### Transaction Validation
```javascript
{
    'Transaction ID': 'string, required',
    'Date': 'string, required',
    'Category': 'string, required',
    'Amount': 'number, required',
    'From': 'string, optional',
    'To': 'string, optional',
    'Confirmed': 'boolean, default false',
    'Note': 'string, optional'
}
```

### Batch Validation
```javascript
{
    'Batch ID': 'string, required',
    'Product ID': 'string, required',
    'Unit Cost Price': 'number, positive, required',
    'Quantity': 'integer, positive, required',
    'Import Date': 'string, required'
}
```

## 🔧 Usage Examples

### JavaScript/Axios Examples

```javascript
// Get all products
const products = await axios.get('/api/products');

// Create a product
const newProduct = await axios.post('/api/products', {
    'Product ID': 'PROD003',
    'Product Name': 'New Item',
    'Selling Price': 99.99,
    'Current Stock': 20,
    'Min Stock': 5
});

// Update product stock
const stockUpdate = await axios.patch('/api/products/PROD003/stock', {
    'adjustment': 10
});

// Filter orders
const filteredOrders = await axios.get('/api/orders/filter', {
    params: {
        channel: 'Online',
        process: 'Pending'
    }
});

// Get transaction summary
const summary = await axios.get('/api/transactions/summary');
```

### cURL Examples

```bash
# Health check
curl http://localhost:3000/api/health

# Get products with pagination
curl "http://localhost:3000/api/products?page=1&limit=10"

# Create an order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "OrderID": "ORD003",
    "Order Date": "2025-07-30",
    "Channel": "Online",
    "Platform": "Website",
    "Username": "testuser",
    "Recipient": "Test Customer",
    "Phone Number": "555-0123",
    "Address": "123 Test St"
  }'

# Update batch quantity
curl -X PATCH http://localhost:3000/api/batches/BATCH001/quantity \
  -H "Content-Type: application/json" \
  -d '{"adjustment": -5}'

# Filter transactions
curl "http://localhost:3000/api/transactions/filter?category=Sale&confirmed=true"
```

## 🔄 Rate Limiting

Currently no rate limiting is implemented. For production use, consider implementing rate limiting middleware.

## 📈 Performance Notes

- Average response time: ~327ms
- Health check: ~7ms
- Data operations: ~300-410ms
- Recommended to implement caching for frequently accessed data
- Use pagination for large datasets
- Consider implementing data streaming for very large responses

## 🔐 Security Considerations

- Currently no authentication implemented
- For production, implement JWT authentication
- Validate all input data
- Sanitize data before Google Sheets operations
- Implement proper CORS configuration
- Use HTTPS in production
