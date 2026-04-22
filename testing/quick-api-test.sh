#!/bin/bash

# Quick API test to verify container-to-container communication

API_URL="https://fitness-ai-app.ashycliff-d78872a9.canadacentral.azurecontainerapps.io"

echo "=========================================="
echo "Quick API Connectivity Test"
echo "=========================================="
echo ""

# Test 1: Check if main app is responding
echo "Test 1: Checking main app health..."
echo "URL: $API_URL"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_URL"
echo ""

# Test 2: Try to access login page
echo "Test 2: Checking login page..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_URL/login"
echo ""

# Test 3: Check data tool direct connectivity (from local machine - expected to timeout)
echo "Test 3: Checking data-tool service (expected to timeout from local)..."
timeout 5 curl -v http://fitness-ai-app-data-tool.internal.ashycliff-d78872a9.canadacentral.azurecontainerapps.io:8080/health 2>&1 | head -20
echo ""

echo "=========================================="
echo "Tests Complete"
echo "=========================================="
