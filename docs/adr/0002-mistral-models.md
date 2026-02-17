# ADR 2: Mistral 3B/8B Models Instead of Larger LLMs

**Status:** Accepted

**Context / Problem:**  
The app needs an AI backbone for the chatbot and RAG routing. Options ranged from proprietary APIs (OpenAI GPT-4, Anthropic Claude) to open-source models (Llama, Mistral). Each has different cost, latency, and deployment implications.

**Decision:**  
Use Mistral 3B (routing) and 8B (answer generation) models via Langchain, deployed in a containerized FastAPI service.

**Rationale:**  
- **Cost**: Mistral models are significantly cheaper than GPT-4 ($0.14/1M input tokens vs $30/1M for GPT-4)
- **Inference speed**: 3B/8B models run on modest hardware; 3B completes routing in <100ms
- **Self-hosted option**: Mistral can run on-premises if needed in future
- **Latest models**: Ministral-3B is specifically optimized for instruction-following and classification tasks
- **Compliance**: No data leaves the infrastructure for sensitive fitness data

**Trade-offs / Consequences:**  
- **Quality ceiling**: Smaller models occasionally miss nuanced fitness concepts (e.g., periodization strategies)
- **Operational burden**: Own deployment and model management vs. letting vendor handle it
- **Hardware requirements**: Even 3B requires ~6GB VRAM; larger instances needed as scale grows
- **Long-term**: May need hybrid approach (small model for routing, larger model for complex answers) as complexity grows
