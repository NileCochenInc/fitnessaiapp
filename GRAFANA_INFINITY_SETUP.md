# Grafana Infinity Datasource Setup Guide

## Overview
This setup configures Grafana with the Infinity datasource plugin to visualize data from your Azure admin-dash microservice.

## Files Created

1. **grafana-dashboard-infinity.json** - Dashboard definition with 5 panels querying your admin-dash API
2. **grafana-infinity-datasource.yaml** - Datasource configuration for Infinity plugin
3. **setup-grafana-infinity.sh** - Automated setup script (use if Docker daemon is responsive)

## Quick Setup (Automated)

If Docker is running, execute:
```bash
bash /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/setup-grafana-infinity.sh
```

Then access http://localhost:3000 (admin / admin)

## Manual Setup Steps

If Docker daemon isn't responding, follow these steps:

### Step 1: Start Grafana with Infinity Plugin

```bash
docker stop grafana-local 2>/dev/null || true
docker rm grafana-local 2>/dev/null || true

docker run -d \
  --name grafana-local \
  -p 3000:3000 \
  -e "GF_SECURITY_ADMIN_USER=admin" \
  -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
  -e "GF_INSTALL_PLUGINS=yesoreyeram-infinity-datasource" \
  grafana/grafana:latest

# Wait for startup
sleep 30
```

### Step 2: Get Container ID

```bash
CONTAINER_ID=$(docker ps -q -f "name=grafana-local")
echo $CONTAINER_ID
```

### Step 3: Deploy Datasource Configuration

```bash
docker cp /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/grafana-infinity-datasource.yaml \
  $CONTAINER_ID:/etc/grafana/provisioning/datasources/infinity.yaml
```

### Step 4: Deploy Dashboard

```bash
docker cp /Users/nilecochen/Documents/FullStack/pairProgram/fitness-ai-app/grafana-dashboard-infinity.json \
  $CONTAINER_ID:/etc/grafana/provisioning/dashboards/fitness.json
```

### Step 5: Create Dashboard Provisioning Config

```bash
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
```

### Step 6: Restart Grafana

```bash
docker restart $CONTAINER_ID
sleep 15
```

### Step 7: Verify

```bash
curl -s http://localhost:3000/api/health | grep edition
```

## Access Grafana

- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin

## Dashboard Details

### Panels Included

1. **Total Users** (Gauge)
   - Queries: `/total_users` endpoint
   - Displays: Total count of users

2. **Popular Metrics** (Table)
   - Queries: `/popular_metrics` endpoint
   - Shows: Top metrics from last 30 days with counts

3. **Popular Exercises** (Table)
   - Queries: `/popular_exercises` endpoint
   - Shows: Top exercises from last 30 days with counts

4. **Workouts by Day of Week** (Table)
   - Queries: `/weekday_workout_frequency` endpoint
   - Shows: Distribution of workouts across days

5. **Workouts by Date** (Table)
   - Queries: `/workouts_by_date` endpoint
   - Shows: All workouts grouped by date

### Datasource Configuration

- **Type**: Infinity (JSON API)
- **Name**: AdminDash-Infinity
- **Authentication**: Bearer token (embedded in each query)
- **Base URL**: https://fitness-ai-app-admin.ashycliff-d78872a9.canadacentral.azurecontainerapps.io

## Troubleshooting

### Panels show "No data"

1. Verify admin-dash is running:
   ```bash
   curl -s -H "Authorization: Bearer HJKY&&*&HIUHIkt6yui9876" \
     https://fitness-ai-app-admin.ashycliff-d78872a9.canadacentral.azurecontainerapps.io/health
   ```

2. Check Grafana logs:
   ```bash
   docker logs grafana-local
   ```

3. Verify Infinity plugin installed:
   ```bash
   docker exec $(docker ps -q -f "name=grafana-local") \
     grafana-cli plugins list | grep infinity
   ```

### Docker daemon not responding

Restart Docker:
```bash
# macOS
open -a Docker

# Wait 30 seconds then retry setup
```

## File Contents

### grafana-infinity-datasource.yaml
```yaml
apiVersion: 1
datasources:
  - name: AdminDash-Infinity
    type: yesoreyeram-infinity-datasource
    access: proxy
    jsonData:
      authentication: apiKey
      apiKeyHeader: Authorization
    secureJsonData:
      apiKeyValue: "Bearer HJKY&&*&HIUHIkt6yui9876"
```

### grafana-dashboard-infinity.json
- 5 panels with Infinity datasource queries
- Each panel configured with proper transformations
- Bearer token authentication embedded in each query

## Next Steps

1. Run setup script or manual steps above
2. Access http://localhost:3000
3. View Fitness AI App Admin Dashboard
4. Data should populate from your Azure admin-dash service

## Reference

- [Infinity Datasource Documentation](https://github.com/yesoreyeram/grafana-infinity-datasource)
- Admin-dash API endpoints:
  - `/health` - Service health check
  - `/total_users` - Count of users
  - `/popular_metrics` - Top metrics (30 days)
  - `/popular_exercises` - Top exercises (30 days)
  - `/weekday_workout_frequency` - Workout distribution by day
  - `/workouts_by_date` - All workouts by date
