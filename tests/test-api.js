const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api';

// Test function
async function testAPI() {
    console.log('🚀 Starting API tests...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data.message);
        console.log('   Google Sheets Connected:', healthResponse.data.google_sheets.connected);
        console.log('   Available Sheets:', healthResponse.data.google_sheets.available_sheets);
        console.log('');

        // Test 2: API Info
        console.log('2. Testing API Info...');
        const infoResponse = await axios.get(`${BASE_URL}/info`);
        console.log('✅ API Info:', infoResponse.data.api.name);
        console.log('   Version:', infoResponse.data.api.version);
        console.log('   Available Endpoints:', Object.keys(infoResponse.data.api.endpoints));
        console.log('');

        // Test 3: Products endpoint (basic GET)
        console.log('3. Testing Products endpoint...');
        const productsResponse = await axios.get(`${BASE_URL}/products`);
        console.log('✅ Products endpoint working');
        console.log('   Found', productsResponse.data.count, 'products');
        console.log('');

        // Test 4: Create a test product (if you want to test writing)
        // Uncomment the following lines to test product creation:
        
        console.log('4. Testing Product Creation...');
        const newProduct = {
            'Product ID': 'TEST003',
            'Product Name': 'Test Product 3',
            'Selling Price': 199.99,
            'Current Stock': 15,
            'Min Stock': 3
        };
        
        try {
            const createResponse = await axios.post(`${BASE_URL}/products`, newProduct);
            console.log('✅ Product created successfully:', createResponse.data.message);
        } catch (error) {
            if (error.response && error.response.status === 409) {
                console.log('ℹ️  Product already exists (this is expected on subsequent runs)');
            } else {
                throw error;
            }
        }
        console.log('');

        // Test 5: Test Orders with new OrderID functionality
        console.log('5. Testing Orders with OrderID...');
        
        // Test getting all orders
        const ordersResponse = await axios.get(`${BASE_URL}/orders`);
        console.log('✅ Orders endpoint working');
        console.log('   Found', ordersResponse.data.count, 'orders');
        
        // Test creating an order with OrderID
        const newOrder = {
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
        };
        
        try {
            const _createOrderResponse = await axios.post(`${BASE_URL}/orders`, newOrder);
            console.log('✅ Order created successfully with OrderID:', newOrder.OrderID);
            
            // Test getting order by OrderID
            const getOrderResponse = await axios.get(`${BASE_URL}/orders/id/${newOrder.OrderID}`);
            console.log('✅ Retrieved order by OrderID:', getOrderResponse.data.data.OrderID);
            
            // Test updating order
            const _updateResponse = await axios.put(`${BASE_URL}/orders/OrderID/${newOrder.OrderID}`, {
                'Process': 'Completed',
                'Remark': 'Test completed successfully'
            });
            console.log('✅ Order updated successfully');
            
        } catch (error) {
            if (error.response && error.response.status === 409) {
                console.log('ℹ️  Order already exists (this is expected on subsequent runs)');
                
                // Still test getting the existing order
                try {
                    const getOrderResponse = await axios.get(`${BASE_URL}/orders/id/${newOrder.OrderID}`);
                    console.log('✅ Retrieved existing order by OrderID:', getOrderResponse.data.data.OrderID);
                } catch (getError) {
                    console.log('❌ Could not retrieve existing order:', getError.message);
                }
            } else {
                throw error;
            }
        }
        console.log('');

        console.log('🎉 All tests passed! Your API is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error Details:', error.response.data);
        }
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('   💡 Make sure the server is running on port 3000');
        }
        
        if (error.message.includes('Google Sheets')) {
            console.error('   💡 Check your Google Sheets configuration in .env file');
        }
    }
}

// Run the tests
testAPI();

module.exports = { testAPI };
