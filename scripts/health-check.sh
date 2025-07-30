#!/bin/bash

# Health Check Script
# This script performs a comprehensive health check of the Retail Management API

API_URL="http://localhost:3000"
HEALTH_ENDPOINT="/api/health"
INFO_ENDPOINT="/api/info"

echo "🏥 Retail Management API Health Check"
echo "=================================="

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s --fail "$API_URL$HEALTH_ENDPOINT" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    echo "💡 Try running 'npm start' to start the server"
    exit 1
fi

# Get health status
echo ""
echo "🔍 Getting health status..."
HEALTH_RESPONSE=$(curl -s "$API_URL$HEALTH_ENDPOINT")
if echo "$HEALTH_RESPONSE" | jq -r '.success' | grep -q "true"; then
    echo "✅ API is healthy"
    
    # Check Google Sheets connection
    if echo "$HEALTH_RESPONSE" | jq -r '.google_sheets.connected' | grep -q "true"; then
        echo "✅ Google Sheets is connected"
        
        # Show available sheets
        SHEETS=$(echo "$HEALTH_RESPONSE" | jq -r '.google_sheets.available_sheets[]' | tr '\n' ', ' | sed 's/,$//')
        echo "📊 Available sheets: $SHEETS"
    else
        echo "❌ Google Sheets connection failed"
        echo "💡 Check your Google Sheets credentials in .env file"
    fi
else
    echo "❌ API health check failed"
fi

# Get API information
echo ""
echo "🔍 Getting API information..."
INFO_RESPONSE=$(curl -s "$API_URL$INFO_ENDPOINT")
if echo "$INFO_RESPONSE" | jq -r '.success' | grep -q "true"; then
    API_NAME=$(echo "$INFO_RESPONSE" | jq -r '.api.name')
    API_VERSION=$(echo "$INFO_RESPONSE" | jq -r '.api.version')
    echo "✅ API: $API_NAME (v$API_VERSION)"
else
    echo "❌ Could not get API information"
fi

# Test basic endpoints
echo ""
echo "🔍 Testing basic endpoints..."

ENDPOINTS=(
    "/api/products"
    "/api/orders" 
    "/api/order-details"
    "/api/transactions"
    "/api/batches"
)

for endpoint in "${ENDPOINTS[@]}"; do
    if curl -s --fail "$API_URL$endpoint" > /dev/null; then
        echo "✅ $endpoint is responding"
    else
        echo "❌ $endpoint is not responding"
    fi
done

# Performance check
echo ""
echo "🔍 Performance check..."
START_TIME=$(date +%s%N)
curl -s "$API_URL$HEALTH_ENDPOINT" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(((END_TIME - START_TIME) / 1000000))
echo "⚡ Health endpoint response time: ${RESPONSE_TIME}ms"

if [ $RESPONSE_TIME -lt 100 ]; then
    echo "✅ Excellent response time"
elif [ $RESPONSE_TIME -lt 500 ]; then
    echo "✅ Good response time"
elif [ $RESPONSE_TIME -lt 1000 ]; then
    echo "⚠️  Acceptable response time"
else
    echo "❌ Slow response time - consider optimization"
fi

echo ""
echo "🎉 Health check complete!"
