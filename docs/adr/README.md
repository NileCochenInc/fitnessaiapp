# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records (ADRs) documenting significant architectural choices made in the Fitness AI App project.

## Overview

ADRs capture the rationale behind major technical decisions, including the context that prompted the decision, what was decided, why it was chosen, and what trade-offs were accepted.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-multi-agent-rag-architecture.md) | Multi-Agent RAG Architecture for AI Chatbot | Accepted |
| [0002](0002-mistral-models.md) | Mistral 3B/8B Models Instead of Larger LLMs | Accepted |
| [0003](0003-polyglot-architecture.md) | Polyglot Architecture (TypeScript/Next.js, Python FastAPI, C# Admin) | Accepted |
| [0004](0004-postgresql-pgvector.md) | PostgreSQL with pgvector Extension vs. Separate Vector DB | Accepted |

## Format

Each ADR follows this structure:

- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context / Problem**: What situation or problem prompted the decision?
- **Decision**: What was decided?
- **Rationale**: Why was this decision made? Benefits and reasoning?
- **Trade-offs / Consequences**: What are the costs, limitations, or long-term implications?

## Adding New ADRs

When making significant architectural decisions:

1. Create a new file: `NNNN-kebab-case-title.md`
2. Use the next sequential number
3. Follow the format specified above
4. Add an entry to this README's index
5. Commit with a message like "ADR: Add decision on X"

## References

- [ADR GitHub page](https://adr.github.io/)
- [Markdown ADR template](https://github.com/joelparkerhenderson/architecture_decision_record)
