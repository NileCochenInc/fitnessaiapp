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

Run tests
pnpm run test