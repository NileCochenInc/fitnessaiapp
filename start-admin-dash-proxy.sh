#!/bin/bash

# Simple HTTP proxy for admin-dash API
# Proxies requests to admin-dash with bearer token authentication

PORT=${1:-3001}

echo "Starting admin-dash proxy on port $PORT..."

docker run -d --name admin-dash-proxy \
  -p $PORT:80 \
  -e "PROXY_TARGET=https://fitness-ai-app-admin.ashycliff-d78872a9.canadacentral.azurecontainerapps.io" \
  -e "PROXY_AUTH_HEADER=Authorization: Bearer HJKY&&*&HIUHIkt6yui9876" \
  --network host \
  nginx:latest \
  sh -c 'cat > /etc/nginx/nginx.conf << "CONF"
events { worker_connections 1024; }
http {
  server {
    listen 80;
    location / {
      proxy_pass $PROXY_TARGET;
      proxy_set_header Authorization "Bearer HJKY&&*&HIUHIkt6yui9876";
      proxy_ssl_verify off;
      add_header Access-Control-Allow-Origin "*";
    }
  }
}
CONF
nginx -g "daemon off;"' 2>&1

echo "Proxy started on localhost:$PORT"
echo "Test with: curl http://localhost:$PORT/total_users"
