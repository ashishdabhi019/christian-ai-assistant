# FaithGuide: Short Architecture Note

**Overview**
FaithGuide is a multimodal, denomination-aware Christian AI assistant. The architecture prioritizes strict scripture grounding, safety, and edge-case handling over complex backend infrastructure, using a lightweight React frontend connected directly to AI inference APIs.

**Tech Stack**
- **Frontend:** React 18 (Vite)
- **Text Generation API:** OpenRouter (Mistral 7B / Auto routing)
- **Image Generation API:** Pollinations.ai (Flux model, free tier)

**Safety & Grounding Architecture (4-Layer Approach)**
1. **Client-Side Intercept:** A regex pre-filter scans user input for adversarial patterns (e.g., "rewrite this verse to support X"). Blocked prompts bypass the API entirely, returning a hardcoded pastoral refusal.
2. **Dynamic Context Injection:** The user's selected denomination (e.g., Catholic, Baptist) is dynamically injected into the system prompt before every call, ensuring theological alignment.
3. **Prompt-Level Guardrails:** The system prompt explicitly enforces formatting (`Book Chapter:Verse`), forbids hallucinating or inventing scripture, and instructs the model to gently correct users who provide fake verses. It also enforces hedging for historical claims.
4. **Multimodal Filtering:** Image prompts are scanned for occult or inappropriate keywords before being securely appended with quality modifiers (`sacred, reverent, divine lighting`) and routed to the Pollinations Flux API.

**Conversation Memory**
Stateful memory is handled via an in-session React state array. The full conversation history is serialized and passed as context to the OpenRouter API on every request, allowing for seamless contextual follow-ups without requiring a persistent database for the MVP.

**Future Production Roadmap**
For a production deployment, the architecture would evolve to include a dedicated backend (Node/Express), a vector database (Pinecone/Weaviate) for RAG over the 66 books of the Bible, and a persistent session store (PostgreSQL) for user histories.
