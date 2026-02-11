Run:
docker compose up --build

Stop:
docker compose down

Check database:
docker volume ls

Delete database:
docker volume rm fitness-ai-app_db-data

Connect to database:
docker exec -it fitness-ai-app-postgres-1 psql -U postgres -d fitnessdb 

Run next.js app with hot reloads
pnpm run dev

Start test database
docker compose --profile test up postgres-test -d

Run all containers including test DB:
docker compose --profile test up -d

Stop test database
docker compose --profile test down

Run unit tests
pnpm run test:unit

Run frontend tests
pnpm run test:frontend

Run integration tests
docker compose exec server pnpm run test:integration

Run production service and database:
docker compose -f docker-compose.prod.yml up -d

build production service and database:
docker compose -f docker-compose.prod.yml up -d --build

build and deploy next.js app
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --provenance=false \
  -f front-and-back-end/Dockerfile \
  -t nilecochen/fitnessaiapp:latest \
  --push \
  front-and-back-end

Rebuild AI container

Run python main
docker exec fitness-ai-app-ai-1 python -m app.main 

access produciton database
docker exec -it fitnessaiapp-postgres-1 psql -U postgres -d fitnessdb

create production database dump
docker exec -i fitnessaiapp-postgres-1 pg_dump -U postgres -d fitnessdb -F p > ~/production_dump.sql


Copy dump (replace user and your_vps_ip)
scp user@your_vps_ip:~/production_dump.sql ./production_dump.sql

scp root@138.68.44.246:~/production_dump.sql ./production_dump.sql
