# ADR 1: Multi-Agent RAG Architecture for AI Chatbot

**Status:** Accepted

**Context / Problem:**  
The fitness app needs to provide intelligent fitness advice to users based on their personal workout and exercise history. A naive LLM approach would either: (a) ignore user history, providing generic advice, or (b) require expensive context window usage with raw data dumps. Additionally, the system must prevent harmful outputs like medical advice that shouldn't come from an AI trainer.

**Decision:**  
Implement a three-stage agent system: (1) Guardrail checking, (2) RAG route classification, (3) Embeddings + contextual retrieval + LLM generation. The system filters out medical advice and off-topic questions before attempting to answer.

**Rationale:**  
- **Personalization**: User workout embeddings enable specific, relevant answers tailored to their fitness journey
- **Safety**: Explicit guardrails prevent the AI from generating harmful medical advice
- **Cost efficiency**: Route classification (EXERCISES/WORKOUTS/BOTH/NEITHER) reduces unnecessary database queries
- **Transparency**: Multi-stage processing allows users to see "System_message" progress updates, building trust

**Trade-offs / Consequences:**  
- **Complexity**: More moving parts than a simple LLM API call; requires maintaining embeddings, guardrail rules, and routing logic
- **Latency**: Multiple sequential LLM calls and database queries add ~2-5 seconds per response vs. 0.5s for direct LLM
- **Maintenance**: Guardrail rules and embedding strategies need periodic tuning as user behavior changes
