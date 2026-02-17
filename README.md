# 💪 Fitness Ai App

A full-stack fitness journal application enabling users to track workouts, log exercises with custom metrics, and monitor progress toward personal fitness goals.

## 🌐 Live App
https://fitnessaiapp.duckdns.org/

## Features

- **Goal Management 🏆** — Set, track, and manage fitness goals with progress tracking
- **Multi Agent RAG AI Chatbot 💬** - Three-agent chatbot with workout history context and safe guardrails
- **Workout Logging 📝** — Record dated workouts (strength, rowing, mixed) with exercise entries and custom metrics
- **Exercise Management** — Global exercise library with user-specific custom exercises
- **User Authentication 🧑‍💻** — Secure authentication via email/password and Google OAuth
- **Metrics Tracking** — Log custom metrics (weight, reps, duration, etc.) for each exercise entry
- **Responsive Design 📱** — Mobile-first interface optimized for desktop and mobile

## Tech Stack

**AI Service**
- Python Langchain orchestration
- Mistral 3 3B and 8B models

**Frontend:**
- Next.js 16 with React 19 & TypeScript
- Tailwind CSS 4 for styling
- NextAuth.js 4 for authentication

**Backend & Database:**
- Next.js 16 with Node.js & TypeScript
- PostgreSQL 16
- Zod 4.3 for schema validation
- Bcrypt 6 for password hashing

**Admin Data Dashboard**
- Secured admin-only API provides aggregated global user data
- ASP.NET Core API with C# .NET 10
- Entity Core ORM

**DevOps & Testing:**
- Docker & Docker Compose (development & production)
- Jest 30 with Testing Library (unit, integration, frontend tests)
- xUnit for .NET admin data API testing

**Deployment:**
- Docker Hub
- Production-ready PostgreSQL volumes

## Architecture

### Multi Agent Flow
![Multi Agent Diagram](info/Multi-Agent-flow.svg)

### Container Architecture
![Container Diagram](info/ContainerDiagram.svg)

### Database Schema
![Database Schema](info/Schema-V2.png)

### User Flow
![User Flow Diagram](info/Userflow.svg)

## AI RAG Multi-Agent Pipeline

The multi-agent chatbot implements a four-stage intelligent reasoning pipeline that combines guardrails, semantic routing, vector-based retrieval, and language model-powered answer generation. This design ensures safe, contextual responses grounded in the user's actual workout and exercise history.

### Pipeline Stages

#### 1. **Question Guardrails (Safety & Classification)**

The first stage acts as a safety filter to prevent hallucinated medical advice and off-topic responses.

- **Model:** Ministral-3B (lightweight, 0 temperature for deterministic classification)
- **Classification Categories:**
  - `FITNESS_OK` — Safe to answer using fitness context and user data
  - `MEDICAL_ADVICE` — Question requires qualified healthcare professional (e.g., injury diagnosis, medication interactions)
  - `NON_FITNESS` — Question outside fitness domain (redirected to appropriate expert)
- **Context Awareness:** Evaluates the full conversation history, not just the current message, to understand multi-turn intent
- **Benefit:** Prevents the model from inventing medical facts or nutritional claims while maintaining conversational flow

#### 2. **RAG Director (Intelligent Intent Routing)**

Once a question passes guardrails, the director intelligently routes it to the most appropriate data sources to minimize latency and improve answer relevance.

- **Model:** Ministral-3B (fast router, configured with `max_tokens=15` for efficiency)
- **Routing Decisions:**
  - `EXERCISES` — Single or multiple individual exercise entries (e.g., "How many pull-ups did I do last week?")
  - `WORKOUTS` — Complete workout sessions with contextual flow (e.g., "What was my hardest workout last month?")
  - `BOTH` — Hybrid queries requiring both exercise-level and workout-level context (e.g., "Compare my bench press progression across workouts")
  - `NEITHER` — General fitness guidance not requiring personal data (e.g., "What's good form for squats?")
- **Efficiency Gain:** Prevents unnecessary vector searches for general knowledge questions and prioritizes appropriate data granularity

#### 3. **Vector-Based Semantic Retrieval**

The retrieval stage converts user data into vector embeddings and finds semantically similar context to the user's question using PostgreSQL pgvector.

- **Embedding Model:** Mistral-embed (via LangChain)
- **Two Parallel Retrieval Paths:**

  **Exercise Retriever:**
  - Searches user's logged exercises in the `workout_exercises` table
  - Returns up to 10 most similar exercise entries (cosine similarity via pgvector `<=>` operator)
  - Each entry includes: date, exercise name, notes, metrics (reps, weight, duration, sets, distance, etc.)
  - User-scoped: Only retrieves exercises belonging to the authenticated user

  **Workout Retriever:**
  - Searches user's complete gym sessions in the `workouts` table
  - Returns up to 10 most similar full workout sessions
  - Each entry includes: date, workout type (strength, rowing, mixed), all exercises within that session with their metrics
  - User-scoped: Only retrieves workouts belonging to the authenticated user

- **Balanced Context Window:**
  - For `BOTH` routing: 5 exercises + 5 workouts (balanced context)
  - For `EXERCISES`: 10 exercise entries
  - For `WORKOUTS`: 10 workout sessions
  - For `NEITHER`: No retrieval; pure LLM knowledge is used
- **Data Isolation:** All vector searches are filtered by `user_id`, ensuring strict data privacy

#### 4. **Answer Generation (LLM Synthesis)**

The final stage uses a larger language model to synthesize the retrieved context, conversation history, and user question into a coherent, actionable response.

- **Model:** Ministral-8B (larger capacity for quality responses)
- **System Prompt:** Enforces conciseness, practical advice, and bullet-point formatting with a ~150-word limit
- **Input Context:**
  - Retrieved documents from Stage 3 (exercises/workouts)
  - Full conversation history (enables multi-turn dialogue without repeating context)
  - Original user question
- **Output Constraint:** Model instructed to use only context-grounded information and avoid inventing facts
- **Example:** If user asks "How have my squats improved?" and Stage 3 retrieves 10 past squat exercises, the model synthesizes weight/rep trends with personalized insights

### Data Flow Summary

| Question Type | Routing | Retrieval | Context Retrieved |
|---|---|---|---|
| "How many exercises did I do on Tuesday?" | EXERCISES | Exercise retriever | 10 exercise entries from that day |
| "What was my most intense workout?" | WORKOUTS | Workout retriever | 10 complete workout sessions |
| "How has my bench press progressed?" | BOTH | Both retrievers | 5 bench press exercises + 5 workouts containing bench press |
| "What's proper deadlift form?" | NEITHER | None | General LLM knowledge (no retrieval) |
| "Is squatting bad for my knees?" | MEDICAL (blocked at Stage 1) | — | Response redirects to healthcare professional |

### Real-Time Streaming Updates

The chat API (`/api/chat`) streams progress through Server-Sent Events (SSE), providing real-time feedback on each pipeline stage:

```
System_message: Running guardrail check
System_message: Analyzing your question...
System_message: Retrieving relevant data from your history
System_message: Answering your question...
[Final Response]
Finished!
```

This streaming approach gives users confidence the system is processing their request and prevents long loading pauses.

### Technical Stack Details

- **Embedding Dimension:** ~1024-dimensional vectors (Mistral-embed)
- **Similarity Metric:** Cosine distance (`<=>` operator in pgvector)
- **Temperature:** 0.0 for guardrails and routing (deterministic), configurable for answer generation
- **Conversation Memory:** Message history is maintained in the request context (`messages` array) across multiple turns
- **Per-User Data Isolation:** All database queries filter by `user_id` from the authenticated session
- **Single-Worker FastAPI:** The AI service runs as a single worker to maintain SSE connection stability


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


