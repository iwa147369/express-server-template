const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function performanceTest() {
    console.log('⚡ Running Performance Tests...\n');
    
    const endpoints = [
        { name: 'Health Check', url: '/health' },
        { name: 'API Info', url: '/info' },
        { name: 'Get All Products', url: '/products' },
        { name: 'Get All Orders', url: '/orders' },
        { name: 'Get All Transactions', url: '/transactions' },
        { name: 'Get All Batches', url: '/batches' },
        { name: 'Get All Order Details', url: '/order-details' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            const response = await axios.get(`${BASE_URL}${endpoint.url}`);
            const end = Date.now();
            const responseTime = end - start;
            
            results.push({
                name: endpoint.name,
                responseTime,
                status: response.status,
                dataCount: response.data.count || response.data.data?.length || 'N/A'
            });
            
            console.log(`✅ ${endpoint.name}: ${responseTime}ms (${response.data.count || response.data.data?.length || 'N/A'} records)`);
        } catch (error) {
            console.log(`❌ ${endpoint.name}: Failed - ${error.message}`);
        }
    }
    
    // Calculate statistics
    const responseTimes = results.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    console.log('\n=== PERFORMANCE SUMMARY ===');
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Fastest Response: ${minResponseTime}ms`);
    console.log(`Slowest Response: ${maxResponseTime}ms`);
    console.log(`Total Endpoints Tested: ${results.length}`);
    
    if (avgResponseTime < 500) {
        console.log('🚀 Excellent performance! All endpoints are responding quickly.');
    } else if (avgResponseTime < 1000) {
        console.log('✅ Good performance! Response times are acceptable.');
    } else {
        console.log('⚠️  Response times could be improved.');
    }
}

if (require.main === module) {
    performanceTest().catch(error => {
        console.error('❌ Performance test failed:', error.message);
        process.exit(1);
    });
}

module.exports = { performanceTest };
