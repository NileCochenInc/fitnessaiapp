# ADR 4: PostgreSQL with pgvector Extension vs. Separate Vector DB

**Status:** Accepted

**Context / Problem:**  
The system needs to store and query vector embeddings for workouts and exercises (for RAG retrieval). Options were: (1) dedicated vector database (Pinecone, Weaviate), (2) PostgreSQL with pgvector extension, (3) Elasticsearch.

**Decision:**  
Use PostgreSQL 16 with pgvector extension as the single vector store, avoiding a separate specialized database.

**Rationale:**  
- **Operational simplicity**: Single database to backup, monitor, and scale rather than managing two databases
- **ACID guarantees**: Vectors stay in sync with relational data (e.g., if a workout is deleted, its embedding is too)
- **Cost**: Avoid paying for two managed databases; pgvector is free
- **Query flexibility**: Can do hybrid queries (SQL filters + vector similarity) in one query
- **Smaller scale fit**: For current user base, pgvector performance is more than adequate

**Trade-offs / Consequences:**  
- **Vector search performance**: Not optimized like Pinecone/Weaviate for massive-scale similarity search; queries degrade if embeddings table grows beyond millions
- **Scaling limitations**: Single PostgreSQL instance becomes bottleneck before dedicated vector DB would
- **Feature parity**: Specialized vector DBs offer features like advanced indexing (HNSW), namespacing, and tenancy that pgvector lacks
- **Future migration**: If user base grows 100x, will need to migrate to dedicated vector DB (non-trivial refactor)
