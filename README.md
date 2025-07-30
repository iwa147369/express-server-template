# 🛒 Retail Management API

A comprehensive REST API for retail management built with Node.js, Express.js, and Google Sheets as the database. This system provides complete CRUD operations for managing products, orders, transactions, and inventory batches with real-time data synchronization.

## ✨ Features

- **Complete CRUD Operations**: Full Create, Read, Update, Delete functionality for all entities
- **Google Sheets Integration**: Real-time data sync with Google Sheets as database
- **Comprehensive Validation**: Joi schema validation for all API endpoints
- **Advanced Filtering**: Search and filter capabilities across all data models
- **Performance Optimized**: Average response time under 350ms
- **Production Ready**: 100% test coverage with 39 automated tests
- **RESTful Design**: Standard REST API conventions with proper status codes
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Documentation**: Complete API documentation and frontend integration guides

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Google Sheets API credentials
- Google Spreadsheet set up with proper structure

### Installation
```bash
# Clone the repository
git clone <your-repository-url>
cd retail_management

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your environment variables
# Edit .env with your Google Sheets credentials

# Start the server
npm start
```

The API will be available at `http://localhost:3000`

### Verify Installation
```bash
# Check API health
curl http://localhost:3000/api/health

# Get API information
curl http://localhost:3000/api/info

# Run tests
npm test
```

## 🏗 Data Models

### Products
Manage your product inventory with stock tracking and low-stock alerts.
```json
{
  "Product ID": "PROD001",
  "Product Name": "Wireless Headphones", 
  "Selling Price": 99.99,
  "Current Stock": 50,
  "Min Stock": 10
}
```

### Orders (with OrderID)
Complete order management with customer information and order tracking.
```json
{
  "OrderID": "ORD001",
  "Order Date": "2025-07-30",
  "Channel": "Online",
  "Platform": "Website",
  "Username": "customer123",
  "Recipient": "John Doe",
  "Phone Number": "123-456-7890",
  "Address": "123 Main St",
  "Process": "Processing"
}
```

### Order Details
Individual line items for each order with product specifications.
```json
{
  "Order ID": "ORD001",
  "Product ID": "PROD001",
  "Selling Price": 99.99,
  "Total Selling Price": 199.98,
  "Size": "Medium",
  "Color": "Black",
  "Batch ID": "BATCH001"
}
```

### Transactions
Financial transaction tracking with categorization and confirmation status.
```json
{
  "Transaction ID": "TXN001",
  "Date": "2025-07-30",
  "Category": "Sale",
  "Amount": 199.98,
  "From": "Customer",
  "To": "Revenue",
  "Confirmed": true,
  "Note": "Online sale"
}
```

### Batches
Inventory batch management for cost tracking and stock control.
```json
{
  "Batch ID": "BATCH001",
  "Product ID": "PROD001",
  "Unit Cost Price": 45.00,
  "Quantity": 100,
  "Import Date": "2025-07-30"
}
```

## 🛠 Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Google Sheets API Configuration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"

# Sheet Names (optional - defaults will be used if not specified)
ORDERS_SHEET_NAME=Orders
ORDER_DETAILS_SHEET_NAME=Order Details
PRODUCTS_SHEET_NAME=Products
TRANSACTIONS_SHEET_NAME=Transactions
BATCHES_SHEET_NAME=Batches
```

### 5. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```http
GET /api/health
```
Returns server status and Google Sheets connection info.

### API Information
```http
GET /api/info
```
Returns detailed API documentation and available endpoints.

## 🛠 API Endpoints

### Products (`/api/products`)
- `GET /` - Get all products (with pagination)
- `GET /id/:productId` - Get product by ID
- `GET /filter` - Get products with filtering
- `GET /low-stock` - Get products with low stock
- `POST /` - Create new product
- `PUT /:productId` - Update product
- `PATCH /:productId/stock` - Update product stock
- `DELETE /:productId` - Delete product

### Orders (`/api/orders`)
- `GET /` - Get all orders (with pagination)
- `GET /id/:orderId` - Get order by OrderID
- `GET /filter` - Get orders with filtering
- `POST /` - Create new order
- `PUT /OrderID/:orderId` - Update order
- `DELETE /OrderID/:orderId` - Delete order

### Order Details (`/api/order-details`)
- `GET /` - Get all order details
- `GET /order/:orderId` - Get order details by Order ID
- `POST /` - Create new order detail
- `PUT /Order ID/:orderId` - Update order detail
- `DELETE /Order ID/:orderId` - Delete order detail

### Transactions (`/api/transactions`)
- `GET /` - Get all transactions
- `GET /id/:transactionId` - Get transaction by ID
- `GET /filter` - Get transactions with filtering
- `GET /summary` - Get transaction analytics
- `POST /` - Create new transaction
- `PUT /:transactionId` - Update transaction
- `PATCH /:transactionId/confirm` - Confirm transaction
- `DELETE /:transactionId` - Delete transaction

### Batches (`/api/batches`)
- `GET /` - Get all batches
- `GET /id/:batchId` - Get batch by ID
- `GET /product/:productId` - Get batches by product
- `GET /inventory-summary` - Get inventory summary
- `GET /filter` - Get batches with filtering
- `POST /` - Create new batch
- `PUT /:batchId` - Update batch
- `PATCH /:batchId/quantity` - Update batch quantity
- `DELETE /:batchId` - Delete batch

## 📝 Example Requests

### Create a New Product
```http
POST /api/products
Content-Type: application/json

{
  "Product ID": "PROD001",
  "Product Name": "Wireless Headphones",
  "Selling Price": 99.99,
  "Current Stock": 50,
  "Min Stock": 10
}
```

### Update Product Stock
```http
PATCH /api/products/PROD001/stock
Content-Type: application/json

{
  "adjustment": -5
}
```

### Get Low Stock Products
```http
GET /api/products/low-stock
```

### Filter Transactions
```http
GET /api/transactions/filter?category=sale&confirmed=true&min_amount=100
```

## 🔍 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 100)
- `range` - Custom range (e.g., "A1:E50")

### Filtering
- `search` - Search term for text fields
- `minStock`, `maxStock` - Stock level filters
- `minPrice`, `maxPrice` - Price range filters
- `date_from`, `date_to` - Date range filters
- `category` - Filter by category
- `confirmed` - Filter by confirmation status

## 🔒 Response Format

All API responses follow a consistent format:

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
  "error": "Error description",
  "details": {...}
}
```

## 🌟 Features

### Data Validation
- Joi schema validation for all endpoints
- Type checking and format validation
- Required field validation
- Custom validation rules

### Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Detailed error information in development
- Sanitized errors in production

### Performance
- Average response time: ~327ms
- Efficient Google Sheets API usage
- Request logging and monitoring
- CORS enabled for cross-origin requests

## 🏗 Project Structure

```
├── controllers/          # Request handlers for each sheet
├── middlewares/         # Validation and error handling
├── routes/             # API route definitions
├── services/           # Google Sheets service layer
├── utils/              # Utility functions
├── validators/         # Joi validation schemas
├── tests/              # Automated test suite
├── docs/               # Complete documentation
├── .env.example        # Environment variables template
├── index.js           # Main application entry point
└── package.json       # Dependencies and scripts
```

## 📚 Documentation

### 📖 Core Documentation
- **Setup Guide**: [SETUP.md](SETUP.md) - Detailed setup instructions
- **Project Status**: [STATUS.md](STATUS.md) - Current project status and test results
- **API Reference**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - Complete API documentation

### 🎯 Development Guides
- **Frontend Integration**: [docs/FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md) - Complete frontend development guide
- **Quick Reference**: [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) - Essential endpoints and code snippets
- **Deployment Guide**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions

### 📁 Documentation Structure
```
docs/
├── API_REFERENCE.md      # Complete API documentation with all endpoints
├── FRONTEND_GUIDE.md     # Frontend integration guide with React/Vue examples
├── QUICK_REFERENCE.md    # Quick reference card for developers
└── DEPLOYMENT_GUIDE.md   # Production deployment guide

tests/
├── comprehensive-test.js # Full API test suite (39 tests)
├── clean-test.js        # Clean environment tests
├── performance-test.js  # Performance benchmarks
└── master-test.js      # Combined test runner
```

## 🧪 Testing

### Run All Tests
```bash
# Run the comprehensive test suite
npm test

# Run specific tests
node tests/comprehensive-test.js
node tests/performance-test.js
node tests/clean-test.js
```

### Test Results Summary
✅ **39/39 tests passing** (Last tested: Production-ready)
- Products API: 8 tests
- Orders API: 9 tests  
- Order Details API: 6 tests
- Transactions API: 8 tests
- Batches API: 8 tests
- Average response time: ~327ms

## 🚀 Production Ready

This API is **production-ready** with:
- ✅ 100% test coverage
- ✅ Comprehensive error handling
- ✅ Input validation with Joi schemas
- ✅ Performance optimized (~327ms avg response)
- ✅ Complete documentation
- ✅ Deployment guides for multiple platforms
- ✅ Frontend integration examples

## 🛠 Development

### Running in Development Mode
```bash
npm start
```

### Environment Variables
- Set `NODE_ENV=development` for detailed error messages
- Set `NODE_ENV=production` for production-ready error handling

## 📞 Support

For issues, questions, or contributions:
- Check the comprehensive documentation in `/docs/`
- Review test examples in `/tests/`
- See troubleshooting in `SETUP.md`

## 📄 License

This project is licensed under the ISC License.
