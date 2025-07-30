const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api';

// Test data IDs for cleanup
const TEST_IDS = {
    productId: 'TEST-PROD-001',
    orderId: 'TEST-ORD-001',
    batchId: 'TEST-BATCH-001',
    transactionId: 'TEST-TXN-001'
};

async function cleanupTestData() {
    console.log('🧹 Cleaning up existing test data...\n');
    
    const cleanupOperations = [
        { name: 'Order Detail', endpoint: `/order-details/Order ID/${TEST_IDS.orderId}` },
        { name: 'Order', endpoint: `/orders/OrderID/${TEST_IDS.orderId}` },
        { name: 'Transaction', endpoint: `/transactions/${TEST_IDS.transactionId}` },
        { name: 'Batch', endpoint: `/batches/${TEST_IDS.batchId}` },
        { name: 'Product', endpoint: `/products/${TEST_IDS.productId}` }
    ];
    
    for (const operation of cleanupOperations) {
        try {
            await axios.delete(`${BASE_URL}${operation.endpoint}`);
            console.log(`✅ Cleaned up ${operation.name}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`ℹ️  ${operation.name} not found (already clean)`);
            } else {
                console.log(`⚠️  Failed to cleanup ${operation.name}: ${error.message}`);
            }
        }
    }
    
    console.log('\n✨ Cleanup completed!\n');
}

async function runCleanTests() {
    // First cleanup
    await cleanupTestData();
    
    // Then run comprehensive tests
    const { runComprehensiveTests } = require('./comprehensive-test.js');
    await runComprehensiveTests();
}

if (require.main === module) {
    runCleanTests().catch(error => {
        console.error('❌ Clean test execution failed:', error.message);
        process.exit(1);
    });
}

module.exports = { cleanupTestData };
