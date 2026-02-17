# ADR 3: Polyglot Architecture (TypeScript/Next.js, Python FastAPI, C# Admin)

**Status:** Accepted

**Context / Problem:**  
The system has three distinct domains: (1) user-facing web app and APIs, (2) AI/ML services with RAG, (3) analytics dashboard for admins. Each has different tooling and team preferences. A monolithic approach would force compromises.

**Decision:**  
Adopt a polyglot microservices architecture: Next.js (Node.js) for user app/APIs, FastAPI (Python) for AI service, C# for admin analytics dashboard. Each service has its own Dockerfile and can be deployed independently.

**Rationale:**  
- **Best tool per job**: TypeScript excels at API/web dev; Python is the standard for ML/embeddings; C# is strong for data aggregation and Windows ecosystem compatibility
- **Team expertise**: Developers can use familiar languages, reducing onboarding friction
- **Technology fit**: Langchain RAG is Python-native; Next.js API routes reduce backend boilerplate; C# LINQ is excellent for analytics queries
- **Independent scaling**: AI service can scale separately from web app based on load patterns

**Trade-offs / Consequences:**  
- **Operational complexity**: Three separate deployment pipelines, Docker images, and CI/CD configs to maintain
- **Network overhead**: Inter-service communication introduces latency (~50-200ms) vs. in-process calls
- **Data consistency**: Eventual consistency challenges if services need to coordinate state
- **Debugging difficulty**: Distributed tracing needed; bugs can span three different ecosystems
- **Hiring constraint**: Need developers familiar with multiple tech stacks; smaller teams may struggle
