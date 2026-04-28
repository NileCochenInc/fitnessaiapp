#!/bin/bash
# Grafana Infinity Setup Script

set -e

echo "🚀 Starting Grafana with Infinity datasource plugin..."

# Stop any existing containers
docker stop grafana-local 2>/dev/null || true
docker rm grafana-local 2>/dev/null || true

# Start Grafana with Infinity plugin
docker run -d \
  --name grafana-local \
  -p 3000:3000 \
  -e "GF_SECURITY_ADMIN_USER=admin" \
  -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
  -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource" \
  grafana/grafana:latest

echo "⏳ Waiting for Grafana to start (30 seconds)..."
sleep 30

# Get container ID
CONTAINER_ID=$(docker ps -q -f "name=grafana-local")
echo "✅ Grafana container ID: $CONTAINER_ID"

# Copy datasource config
echo "📋 Deploying Infinity datasource configuration..."
docker cp /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/grafana-infinity-datasource.yaml \
  $CONTAINER_ID:/etc/grafana/provisioning/datasources/infinity.yaml

# Copy dashboard config  
echo "📊 Deploying admin dashboard..."
docker cp /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/grafana-dashboard-infinity.json \
  $CONTAINER_ID:/etc/grafana/provisioning/dashboards/fitness.json

# Create provisioning config for dashboards
docker exec $CONTAINER_ID sh -c 'cat > /etc/grafana/provisioning/dashboards/dashboards.yaml << EOF
apiVersion: 1
providers:
  - name: Fitness Dashboards
    orgId: 1
    folder: ""
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF'

# Restart Grafana to load configurations
echo "🔄 Restarting Grafana to apply configurations..."
docker restart $CONTAINER_ID

echo "⏳ Waiting for Grafana to restart (15 seconds)..."
sleep 15

# Verify it's running
echo "✅ Verifying Grafana is accessible..."
curl -s http://localhost:3000/api/health | grep -q "edition" && echo "✅ Grafana is running!" || echo "⚠️ Grafana may still be starting..."

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "🎯 Access Grafana:"
echo "   URL: http://localhost:3000"
echo "   User: admin"
echo "   Password: admin"
echo ""
echo "📊 Dashboard:"
echo "   Fitness AI App Admin Dashboard"
echo "   Queries all 5 endpoints from admin-dash API"
echo ""
echo "🔌 Datasource:"
echo "   AdminDash-Infinity"
echo "   Type: Infinity (JSON API)"
echo "   Auth: Bearer token included"
echo ""
