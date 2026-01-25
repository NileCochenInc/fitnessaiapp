# 💪 Fitness Helper V2

A full-stack fitness journal application enabling users to track workouts, log exercises with custom metrics, and monitor progress toward personal fitness goals. Built for UofT Hacks 13.

## Features

- **Goal Management 🏆** — Set, track, and manage fitness goals with progress tracking
- **Workout Logging 📝** — Record dated workouts (strength, rowing, mixed) with exercise entries and custom metrics
- **Exercise Management** — Global exercise library with user-specific custom exercises
- **User Authentication 🧑‍💻** — Secure authentication via email/password and Google OAuth
- **Metrics Tracking** — Log custom metrics (weight, reps, duration, etc.) for each exercise entry
- **Responsive Design 📱** — Mobile-first interface optimized for desktop and mobile

## Tech Stack

**Frontend & Full-Stack:**
- Next.js 16 with React 19 & TypeScript
- Tailwind CSS 4 for styling
- NextAuth.js 4 for authentication

**Backend & Database:**
- PostgreSQL 16 with Node.js (pg driver)
- Zod 4.3 for schema validation
- Bcrypt 6 for password hashing

**DevOps & Testing:**
- Docker & Docker Compose (development & production)
- Jest 30 with Testing Library (unit, integration, frontend tests)
- ESLint 9 for code quality

**Deployment:**
- Docker Hub (multi-platform: linux/amd64, linux/arm64)
- Production-ready PostgreSQL volumes

## Quick Start

### Prerequisites
- Node.js v18+
- Docker & Docker Compose (or local PostgreSQL 16)
- pnpm or npm

### Installation

```bash
git clone <repository-url>
cd fitness-ai-app

# Install dependencies
cd front-and-back-end
pnpm install
```

### Environment Setup

Create `.env.local` in `front-and-back-end/`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fitnessdb
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<your-google-oauth-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
```

### Running Locally

**With Docker:**
```bash
docker compose up --build
# App runs at http://localhost:3000
```

**Without Docker:**
```bash
# Start PostgreSQL separately, then:
pnpm run dev
```

## Development

### Available Scripts

```bash
pnpm run dev          # Start dev server with hot reload
pnpm run build        # Production build
pnpm run start        # Run production build
pnpm run test         # Run all tests
pnpm run test:unit    # Unit tests only
pnpm run test:integration  # Integration tests
pnpm run test:frontend     # Frontend component tests
pnpm run lint         # Run ESLint
```

### Project Structure

```
front-and-back-end/
├── src/
│   ├── app/                    # Next.js app router (pages & API routes)
│   │   ├── api/               # API endpoints
│   │   ├── login/             # Auth pages
│   │   ├── signup/
│   │   ├── add_workout/       # Workout creation
│   │   ├── add_exercise_data/ # Exercise logging
│   │   ├── edit_exercises/    # Exercise management
│   │   └── previous_workouts/ # Workout history
│   ├── components/            # Reusable React components
│   ├── lib/                   # Database & utility functions
│   ├── types/                 # TypeScript type definitions
│   └── tests/                 # Test suites
├── public/                    # Static assets
├── Dockerfile                 # Production image
├── Dockerfile.dev             # Development image
└── package.json
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/signup` | User registration |
| GET/POST | `/api/workouts` | Workout CRUD operations |
| GET/POST | `/api/exercises` | Exercise CRUD operations |
| POST | `/api/exercise_data` | Log exercise entries & metrics |
| * | `/api/auth/[...nextauth]` | NextAuth authentication routes |

## Database Schema

**Core Tables:**
- **users** — User accounts with email, password hash, Google OAuth ID, and fitness goal
- **workouts** — Workout sessions with date and type (strength/rowing/mixed)
- **exercises** — Exercise definitions (global or user-created)
- **workout_exercises** — Join table linking exercises to workouts
- **entries** — Individual set/rep instances within a workout exercise
- **metric_definitions** — Custom metrics (weight, reps, duration, etc.)
- **entry_metrics** — Metric values for entries

**Key Design:**
- User-specific exercises vs. global exercise library
- Cascade delete for referential integrity
- Flexible metrics system for any exercise type

## Testing

Tests organized by scope:

- **Unit Tests** (`tests/unit/`) — Database utilities, API route handlers
- **Integration Tests** (`tests/integration/`) — API + database interactions
- **Frontend Tests** (`tests/frontend/`) — React component rendering & user interactions

Run tests in Docker:
```bash
docker compose --profile test up -d
pnpm run test:integration
pnpm run test:frontend
```

## Deployment

### Docker Image

Built and pushed to Docker Hub: `nilecochen/fitnessaiapp:latest`

Multi-platform support: `linux/amd64`, `linux/arm64`

### Production Deployment

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Requires `.env` file with all required variables. PostgreSQL data persists via Docker volumes.

## Authentication

**Methods:**
- Email/password (credential-based)
- Google OAuth

**Implementation:**
- NextAuth.js 4 with credential & OAuth providers
- Passwords hashed with bcrypt v6
- Session includes user ID and username
- Protected API routes via session validation

## Troubleshooting

**Port conflicts:**
- Dev: Default ports are 3000 (app), 5433 (PostgreSQL)
- Modify `docker-compose.yaml` port mappings if needed

**Google OAuth not working:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Ensure redirect URI is registered in Google Console

**Database connection errors:**
- Ensure PostgreSQL is running (check `docker ps`)
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`

**Tests failing in Docker:**
- Run with test profile: `docker compose --profile test up -d`
- Ensure test database is created and migrations ran

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit with clear messages: `git commit -m "feat: description"`
3. Run tests: `pnpm run test`
4. Run linter: `pnpm run lint`
5. Push and create pull request

## Built With

- **Framework:** Next.js 16, React 19
- **Language:** TypeScript 5
- **Database:** PostgreSQL 16
- **Auth:** NextAuth.js 4
- **Styling:** Tailwind CSS 4
- **Testing:** Jest 30, Testing Library
- **DevOps:** Docker, Docker Compose

---

Built for **UofT Hacks 13** | [Live Demo](fitness-helper-v2.vercel.app)
