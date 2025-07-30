# Retail Management API Testing Framework

This repository includes a comprehensive testing framework for the Google Sheets-based Retail Management API. The testing suite covers all endpoints, performance metrics, and error handling scenarios.

## 🧪 Available Test Scripts

### 1. Basic API Test (`test-api.js`)
Simple health check and basic functionality test.
```bash
npm test
# or
node test-api.js
```

### 2. Comprehensive Test (`comprehensive-test.js`)
Complete functional testing of all endpoints including CRUD operations.
```bash
npm run test:comprehensive
# or
node comprehensive-test.js
```

### 3. Clean Test (`clean-test.js`)
Runs comprehensive tests after cleaning up any existing test data.
```bash
npm run test:clean
# or
node clean-test.js
```

### 4. Performance Test (`performance-test.js`)
Tests API response times and performance metrics.
```bash
npm run test:performance
# or
node performance-test.js
```

### 5. Master Test Suite (`master-test.js`)
Runs all tests in sequence: cleanup → comprehensive → performance.
```bash
npm run test:all
# or
node master-test.js
```

## 📊 Test Coverage

### System Health Tests
- ✅ Health Check endpoint
- ✅ API Info endpoint
- ✅ Google Sheets connectivity

### Products Endpoint Tests
- ✅ Get all products
- ✅ Create product
- ✅ Get product by ID
- ✅ Update product
- ✅ Update product stock
- ✅ Get low stock products
- ✅ Filter products
- ✅ Delete product

### Orders Endpoint Tests (with OrderID)
- ✅ Get all orders
- ✅ Create order with OrderID
- ✅ Get order by OrderID
- ✅ Update order
- ✅ Filter orders
- ✅ Delete order

### Order Details Endpoint Tests
- ✅ Get all order details
- ✅ Create order detail
- ✅ Get order details by Order ID
- ✅ Update order detail
- ✅ Filter order details
- ✅ Delete order detail

### Transactions Endpoint Tests
- ✅ Get all transactions
- ✅ Create transaction
- ✅ Get transaction by ID
- ✅ Update transaction
- ✅ Confirm/unconfirm transaction
- ✅ Filter transactions
- ✅ Transaction summary
- ✅ Delete transaction

### Batches Endpoint Tests
- ✅ Get all batches
- ✅ Create batch
- ✅ Get batch by ID
- ✅ Get batches by Product ID
- ✅ Update batch
- ✅ Update batch quantity
- ✅ Filter batches
- ✅ Batch inventory summary
- ✅ Delete batch

### Advanced Features Tests
- ✅ Complex filtering across all endpoints
- ✅ Pagination support
- ✅ Summary and analytics endpoints
- ✅ Data relationships (Order → Order Details → Products → Batches)

### Error Handling Tests
- ✅ 404 errors for non-existent resources
- ✅ 409 errors for duplicate resources
- ✅ 400 errors for invalid data
- ✅ Validation error handling

## 📈 Test Results Example

```
=== TEST RESULTS SUMMARY ===
Total Tests: 39
✅ Passed: 39
❌ Failed: 0
📊 Success Rate: 100.0%

=== PERFORMANCE SUMMARY ===
Average Response Time: 327.14ms
Fastest Response: 7ms
Slowest Response: 410ms
🚀 Excellent performance!
```

## 🎯 Test Data Structure

The testing framework uses consistent test data across all endpoints:

```javascript
TEST_DATA = {
    product: {
        'Product ID': 'TEST-PROD-001',
        'Product Name': 'Automated Test Product',
        'Selling Price': 299.99,
        'Current Stock': 100,
        'Min Stock': 10
    },
    order: {
        'OrderID': 'TEST-ORD-001',
        'Order Date': '2025-07-30',
        'Channel': 'API-Test',
        // ... more fields
    },
    // ... other test data
}
```

## 🔧 Configuration

You can modify test behavior by editing the `TEST_CONFIG` object in the test files:

```javascript
const TEST_CONFIG = {
    cleanup: true,  // Set to false to keep test data
    verbose: true   // Set to false for less output
};
```

## 🚀 Running Tests in CI/CD

For automated testing in CI/CD pipelines:

```bash
# Ensure server is running
npm start &

# Wait for server to start
sleep 5

# Run all tests
npm run test:all

# Stop server
pkill -f "node index.js"
```

## 📝 Adding New Tests

To add new test cases:

1. **Add test data** to the `TEST_DATA` object
2. **Create test function** following the existing pattern:
```javascript
const testResult = await makeRequest('GET', '/your-endpoint');
trackTest('Your Test Name', testResult.success, testResult.error);
```
3. **Add cleanup** if your test creates data
4. **Update this README** with the new test coverage

## 🐛 Debugging Failed Tests

If tests fail, check:

1. **Server is running** on port 3000
2. **Google Sheets API** is enabled and configured
3. **Environment variables** are properly set
4. **Network connectivity** to Google Sheets
5. **Data consistency** in Google Sheets

Use the debug scripts for troubleshooting:
```bash
node debug-order.js  # Debug specific endpoint issues
```

## 📋 Test Checklist

Before deploying:
- [ ] All health checks pass
- [ ] All CRUD operations work
- [ ] Error handling works correctly
- [ ] Performance is acceptable (< 500ms average)
- [ ] Data relationships are maintained
- [ ] Cleanup successfully removes test data

## 🏆 Success Criteria

A successful test run should show:
- ✅ 100% test success rate
- ⚡ Response times under 500ms average
- 🔗 All Google Sheets integrations working
- 🛡️ Proper error handling for edge cases
- 🧹 Clean data state after test completion
