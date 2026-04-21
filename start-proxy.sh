#!/bin/bash

# Create a simple Node.js-based proxy for admin-dash API
# This handles bearer token authentication transparently

# Start the proxy in the background
cd /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app

echo "🚀 Starting Admin-Dash API Proxy..."
node admin-dash-proxy.js > /tmp/admin-dash-proxy.log 2>&1 &
PROXY_PID=$!

echo "✅ Proxy started with PID: $PROXY_PID"
echo "📡 Proxy running on http://localhost:3001"
echo ""
echo "To stop the proxy, run:"
echo "  kill $PROXY_PID"
echo "  # or"
echo "  pkill -f 'node admin-dash-proxy.js'"
echo ""
echo "Logs available at: /tmp/admin-dash-proxy.log"

# Wait a moment for proxy to start
sleep 2

# Test the proxy
echo ""
echo "Testing proxy..."
curl -s http://localhost:3001/total_users | jq '.' 2>/dev/null && echo "✅ Proxy is working!" || echo "⚠️ Proxy may not be responding yet"
