const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api';

// Test configuration
const TEST_CONFIG = {
    cleanup: true, // Set to false if you want to keep test data
    verbose: true  // Set to false for less output
};

// Test data
const TEST_DATA = {
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
        'Remark': 'Automated test order',
        'Platform': 'Test Platform',
        'Username': 'test-user',
        'Recipient': 'Test Recipient',
        'Phone Number': '555-0123',
        'Address': '123 Test Street, Test City',
        'Process': 'Testing'
    },
    batch: {
        'Batch ID': 'TEST-BATCH-001',
        'Product ID': 'TEST-PROD-001',
        'Unit Cost Price': 150.00,
        'Quantity': 50,
        'Import Date': '2025-07-30'
    },
    transaction: {
        'Transaction ID': 'TEST-TXN-001',
        'Date': '2025-07-30',
        'Category': 'Purchase',
        'Amount': 7500.00,
        'From': 'Test Supplier',
        'To': 'Inventory',
        'Confirmed': false,
        'Note': 'Automated test transaction'
    },
    orderDetail: {
        'Order ID': 'TEST-ORD-001',
        'Product ID': 'TEST-PROD-001',
        'Selling Price': 299.99,
        'Total Selling Price': 599.98,
        'Size': 'L',
        'Color': 'Blue',
        'Batch ID': 'TEST-BATCH-001'
    }
};

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

// Helper functions
function log(message, type = 'info') {
    if (!TEST_CONFIG.verbose && type === 'debug') return;
    
    const prefix = {
        'info': '🔵',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'debug': '🔍'
    };
    
    console.log(`${prefix[type] || '📝'} ${message}`);
}

function trackTest(name, passed, error = null) {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        log(`${name}: PASSED`, 'success');
    } else {
        testResults.failed++;
        log(`${name}: FAILED - ${error}`, 'error');
    }
}

async function makeRequest(method, endpoint, data = null, expectStatus = 200) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.data = data;
        }
        
        const response = await axios(config);
        
        if (response.status === expectStatus) {
            return { success: true, data: response.data, status: response.status };
        } else {
            return { success: false, error: `Expected status ${expectStatus}, got ${response.status}`, status: response.status };
        }
    } catch (error) {
        if (error.response && error.response.status === expectStatus) {
            return { success: true, data: error.response.data, status: error.response.status };
        }
        return { 
            success: false, 
            error: error.response ? JSON.stringify(error.response.data) : error.message,
            status: error.response ? error.response.status : 0
        };
    }
}

// Main test function
async function runComprehensiveTests() {
    console.log('🚀 Starting Comprehensive API Tests...\n');

    try {
        // Test 1: System Health Check
        log('=== SYSTEM HEALTH TESTS ===', 'info');
        
        const healthTest = await makeRequest('GET', '/health');
        trackTest('Health Check', healthTest.success, healthTest.error);
        
        if (healthTest.success) {
            log(`Google Sheets Connected: ${healthTest.data.google_sheets.connected}`, 'debug');
            log(`Available Sheets: ${healthTest.data.google_sheets.available_sheets.join(', ')}`, 'debug');
        }

        const infoTest = await makeRequest('GET', '/info');
        trackTest('API Info', infoTest.success, infoTest.error);
        
        console.log('');

        // Test 2: Products Endpoint
        log('=== PRODUCTS TESTS ===', 'info');
        
        // Get all products
        const getAllProducts = await makeRequest('GET', '/products');
        trackTest('Get All Products', getAllProducts.success, getAllProducts.error);
        
        // Create product
        const createProduct = await makeRequest('POST', '/products', TEST_DATA.product, 201);
        if (!createProduct.success && createProduct.status === 409) {
            trackTest('Create Product (already exists)', true);
            log('Product already exists, continuing with existing product', 'warning');
        } else {
            trackTest('Create Product', createProduct.success, createProduct.error);
        }
        
        // Get product by ID
        const getProduct = await makeRequest('GET', `/products/id/${TEST_DATA.product['Product ID']}`);
        trackTest('Get Product by ID', getProduct.success, getProduct.error);
        
        // Update product
        const updateProduct = await makeRequest('PUT', `/products/${TEST_DATA.product['Product ID']}`, {
            'Selling Price': 349.99,
            'Current Stock': 95
        });
        trackTest('Update Product', updateProduct.success, updateProduct.error);
        
        // Get low stock products
        const lowStock = await makeRequest('GET', '/products/low-stock');
        trackTest('Get Low Stock Products', lowStock.success, lowStock.error);
        
        console.log('');

        // Test 3: Batches Endpoint
        log('=== BATCHES TESTS ===', 'info');
        
        // Get all batches
        const getAllBatches = await makeRequest('GET', '/batches');
        trackTest('Get All Batches', getAllBatches.success, getAllBatches.error);
        
        // Create batch
        const createBatch = await makeRequest('POST', '/batches', TEST_DATA.batch, 201);
        if (!createBatch.success && createBatch.status === 409) {
            trackTest('Create Batch (already exists)', true);
            log('Batch already exists, continuing with existing batch', 'warning');
        } else {
            trackTest('Create Batch', createBatch.success, createBatch.error);
        }
        
        // Get batch by ID
        const getBatch = await makeRequest('GET', `/batches/id/${TEST_DATA.batch['Batch ID']}`);
        trackTest('Get Batch by ID', getBatch.success, getBatch.error);
        
        // Get batches by Product ID
        const getBatchesByProduct = await makeRequest('GET', `/batches/product/${TEST_DATA.batch['Product ID']}`);
        trackTest('Get Batches by Product ID', getBatchesByProduct.success, getBatchesByProduct.error);
        
        // Update batch
        const updateBatch = await makeRequest('PUT', `/batches/${TEST_DATA.batch['Batch ID']}`, {
            'Quantity': 45,
            'Unit Cost Price': 160.00
        });
        trackTest('Update Batch', updateBatch.success, updateBatch.error);
        
        console.log('');

        // Test 4: Transactions Endpoint
        log('=== TRANSACTIONS TESTS ===', 'info');
        
        // Get all transactions
        const getAllTransactions = await makeRequest('GET', '/transactions');
        trackTest('Get All Transactions', getAllTransactions.success, getAllTransactions.error);
        
        // Create transaction
        const createTransaction = await makeRequest('POST', '/transactions', TEST_DATA.transaction, 201);
        if (!createTransaction.success && createTransaction.status === 409) {
            trackTest('Create Transaction (already exists)', true);
            log('Transaction already exists, continuing with existing transaction', 'warning');
        } else {
            trackTest('Create Transaction', createTransaction.success, createTransaction.error);
        }
        
        // Get transaction by ID
        const getTransaction = await makeRequest('GET', `/transactions/id/${TEST_DATA.transaction['Transaction ID']}`);
        trackTest('Get Transaction by ID', getTransaction.success, getTransaction.error);
        
        // Update transaction
        const updateTransaction = await makeRequest('PUT', `/transactions/${TEST_DATA.transaction['Transaction ID']}`, {
            'Amount': 8000.00,
            'Note': 'Updated test transaction'
        });
        trackTest('Update Transaction', updateTransaction.success, updateTransaction.error);
        
        // Confirm transaction
        const confirmTransaction = await makeRequest('PATCH', `/transactions/${TEST_DATA.transaction['Transaction ID']}/confirm`, {
            'confirmed': true
        });
        trackTest('Confirm Transaction', confirmTransaction.success, confirmTransaction.error);
        
        console.log('');

        // Test 5: Orders Endpoint (already tested in previous iteration)
        log('=== ORDERS TESTS ===', 'info');
        
        // Get all orders
        const getAllOrders = await makeRequest('GET', '/orders');
        trackTest('Get All Orders', getAllOrders.success, getAllOrders.error);
        
        // Create order
        const createOrder = await makeRequest('POST', '/orders', TEST_DATA.order, 201);
        if (!createOrder.success && createOrder.status === 409) {
            // Order already exists, that's fine for testing
            trackTest('Create Order (already exists)', true);
            log('Order already exists, continuing with existing order', 'warning');
        } else {
            trackTest('Create Order', createOrder.success, createOrder.error);
        }
        
        // Get order by ID
        const getOrder = await makeRequest('GET', `/orders/id/${TEST_DATA.order['OrderID']}`);
        trackTest('Get Order by ID', getOrder.success, getOrder.error);
        
        // Update order
        const updateOrder = await makeRequest('PUT', `/orders/OrderID/${TEST_DATA.order['OrderID']}`, {
            'Process': 'Completed',
            'Remark': 'Test completed successfully'
        });
        trackTest('Update Order', updateOrder.success, updateOrder.error);
        
        console.log('');

        // Test 6: Order Details Endpoint
        log('=== ORDER DETAILS TESTS ===', 'info');
        
        // Get all order details
        const getAllOrderDetails = await makeRequest('GET', '/order-details');
        trackTest('Get All Order Details', getAllOrderDetails.success, getAllOrderDetails.error);
        
        // Create order detail
        const createOrderDetail = await makeRequest('POST', '/order-details', TEST_DATA.orderDetail, 201);
        trackTest('Create Order Detail', createOrderDetail.success, createOrderDetail.error);
        
        // Get order details by Order ID
        const getOrderDetails = await makeRequest('GET', `/order-details/order/${TEST_DATA.orderDetail['Order ID']}`);
        trackTest('Get Order Details by Order ID', getOrderDetails.success, getOrderDetails.error);
        
        // Update order detail
        const updateOrderDetail = await makeRequest('PUT', `/order-details/Order ID/${TEST_DATA.orderDetail['Order ID']}`, {
            'Selling Price': 319.99,
            'Total Selling Price': 639.98
        });
        trackTest('Update Order Detail', updateOrderDetail.success, updateOrderDetail.error);
        
        console.log('');

        // Test 7: Advanced Features
        log('=== ADVANCED FEATURES TESTS ===', 'info');
        
        // Test filtering
        const filterProducts = await makeRequest('GET', '/products/filter?minStock=50&maxStock=200');
        trackTest('Filter Products', filterProducts.success, filterProducts.error);
        
        const filterOrders = await makeRequest('GET', '/orders/filter?channel=API-Test&process=Completed');
        trackTest('Filter Orders', filterOrders.success, filterOrders.error);
        
        const filterTransactions = await makeRequest('GET', '/transactions/filter?category=Purchase&confirmed=true');
        trackTest('Filter Transactions', filterTransactions.success, filterTransactions.error);
        
        // Test summary endpoints
        const transactionSummary = await makeRequest('GET', '/transactions/summary');
        trackTest('Transaction Summary', transactionSummary.success, transactionSummary.error);
        
        const batchInventory = await makeRequest('GET', '/batches/inventory-summary');
        trackTest('Batch Inventory Summary', batchInventory.success, batchInventory.error);
        
        console.log('');

        // Test 8: Error Handling
        log('=== ERROR HANDLING TESTS ===', 'info');
        
        // Test non-existent resources
        const getNonExistentProduct = await makeRequest('GET', '/products/id/NON-EXISTENT', null, 404);
        trackTest('Get Non-existent Product (404)', getNonExistentProduct.success, getNonExistentProduct.error);
        
        const getNonExistentOrder = await makeRequest('GET', '/orders/id/NON-EXISTENT', null, 404);
        trackTest('Get Non-existent Order (404)', getNonExistentOrder.success, getNonExistentOrder.error);
        
        // Test duplicate creation
        const duplicateProduct = await makeRequest('POST', '/products', TEST_DATA.product, 409);
        trackTest('Create Duplicate Product (409)', duplicateProduct.success, duplicateProduct.error);
        
        // Test invalid data
        const invalidProduct = await makeRequest('POST', '/products', { 'Product ID': 'INVALID' }, 400);
        trackTest('Create Invalid Product (400)', invalidProduct.success, invalidProduct.error);
        
        console.log('');

        // Cleanup (if enabled)
        if (TEST_CONFIG.cleanup) {
            log('=== CLEANUP ===', 'info');
            
            // Delete test data in reverse order of creation
            const cleanupOperations = [
                { name: 'Delete Order Detail', endpoint: `/order-details/Order ID/${TEST_DATA.orderDetail['Order ID']}` },
                { name: 'Delete Order', endpoint: `/orders/OrderID/${TEST_DATA.order['OrderID']}` },
                { name: 'Delete Transaction', endpoint: `/transactions/${TEST_DATA.transaction['Transaction ID']}` },
                { name: 'Delete Batch', endpoint: `/batches/${TEST_DATA.batch['Batch ID']}` },
                { name: 'Delete Product', endpoint: `/products/${TEST_DATA.product['Product ID']}` }
            ];
            
            for (const operation of cleanupOperations) {
                const result = await makeRequest('DELETE', operation.endpoint);
                trackTest(operation.name, result.success, result.error);
            }
        }

    } catch (error) {
        log(`Unexpected error during testing: ${error.message}`, 'error');
    }

    // Print final results
    console.log('\n=== TEST RESULTS SUMMARY ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! Your API is working perfectly!');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
}

// Run the tests
if (require.main === module) {
    runComprehensiveTests().catch(error => {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    });
}

module.exports = { runComprehensiveTests, TEST_DATA };
