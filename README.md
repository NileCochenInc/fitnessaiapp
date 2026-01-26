# 💪 Fitness Ai App

A full-stack fitness journal application enabling users to track workouts, log exercises with custom metrics, and monitor progress toward personal fitness goals.

## Features

- **Goal Management 🏆** — Set, track, and manage fitness goals with progress tracking
- **Workout Logging 📝** — Record dated workouts (strength, rowing, mixed) with exercise entries and custom metrics
- **Exercise Management** — Global exercise library with user-specific custom exercises
- **User Authentication 🧑‍💻** — Secure authentication via email/password and Google OAuth
- **Metrics Tracking** — Log custom metrics (weight, reps, duration, etc.) for each exercise entry
- **Responsive Design 📱** — Mobile-first interface optimized for desktop and mobile

## Tech Stack

**Frontend:**
- Next.js 16 with React 19 & TypeScript
- Tailwind CSS 4 for styling
- NextAuth.js 4 for authentication

**Backend & Database:**
- Next.js 16 with Node.js & TypeScript
- PostgreSQL 16
- Zod 4.3 for schema validation
- Bcrypt 6 for password hashing

**DevOps & Testing:**
- Docker & Docker Compose (development & production)
- Jest 30 with Testing Library (unit, integration, frontend tests)

**Deployment:**
- Docker Hub
- Production-ready PostgreSQL volumes

## Architecture

### Container Architecture
![Container Diagram](info/ContainerDiagram.jpg)

### Database Schema
![Database Schema](info/FitnessAiApp-Schema.png)

### User Flow
![User Flow Diagram](info/UserFlow.jpg)


## Quick Start

### Prerequisites
- Node.js v18+
- Docker & Docker Compose (or local PostgreSQL 16)
- pnpm or npm

### Installation

```bash
git clone https://github.com/NileCochenInc/fitnessaiapp.git
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
```

### Project Structure

```
front-and-back-end/
├── src/
│   ├── app/                   # Next.js app router (pages & API routes)
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

## Testing

Tests organized by scope:

- **Unit Tests** (`tests/unit/`) — Database utilities, API route handlers
- **Integration Tests** (`tests/integration/`) — API + database interactions
- **Frontend Tests** (`tests/frontend/`) — React component rendering & user interactions

Run tests in Docker:
```bash
docker compose --profile test up -d
pnpm run test:unit
pnpm run test:frontend
docker compose exec server pnpm run test:integration
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


