const { runComprehensiveTests } = require('./comprehensive-test.js');
const { performanceTest } = require('./performance-test.js');
const { cleanupTestData } = require('./clean-test.js');

async function runAllTests() {
    console.log('🎯 RETAIL MANAGEMENT API - COMPLETE TEST SUITE');
    console.log('================================================\n');
    
    try {
        // Step 1: Cleanup any existing test data
        console.log('STEP 1: Pre-test Cleanup');
        console.log('------------------------');
        await cleanupTestData();
        
        // Step 2: Run comprehensive functional tests
        console.log('STEP 2: Comprehensive Functional Tests');
        console.log('--------------------------------------');
        await runComprehensiveTests();
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Step 3: Run performance tests
        console.log('STEP 3: Performance Tests');
        console.log('-------------------------');
        await performanceTest();
        
        console.log('\n' + '='.repeat(50));
        console.log('🏆 ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('Your Retail Management API is fully functional and performing well.');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('\n❌ Test suite execution failed:', error.message);
        process.exit(1);
    }
}

// Run all tests
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };
