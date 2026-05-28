# FaithGuide — Architecture Notes

## Overview

FaithGuide is a denomination-aware, scripture-grounded Christian AI assistant built using OpenRouter for text generation and Pollinations.ai for image generation. It combines prompt engineering, client-side safety filtering, multimodal output, and conversation memory.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│   ┌──────────────┐    ┌───────────────────────────┐ │
│   │  Chat Tab    │    │   Sacred Art (Image) Tab  │ │
│   │  - Messages  │    │   - Style picker          │ │
│   │  - Input     │    │   - Prompt input          │ │
│   │  - Denom.    │    │   - Generated image       │ │
│   │    selector  │    │                           │ │
│   └──────┬───────┘    └───────────┬───────────────┘ │
└──────────┼────────────────────────┼─────────────────┘
           │                        │
           ▼                        ▼
┌───────────────────────┐ ┌───────────────────────────┐
│       OpenRouter      │ │     Pollinations.ai       │
│  ┌─────────────────┐  │ │  ┌─────────────────────┐  │
│  │   Text API      │  │ │  │   Image API (Free)  │  │
│  │ (mistral/auto)  │  │ │  │   (Flux model)      │  │
│  └─────────────────┘  │ │  └─────────────────────┘  │
└───────────────────────┘ └───────────────────────────┘
```

---

## Grounding Strategy

### 1. Denomination-Aware System Prompt

The system prompt dynamically injects denomination context (one of 7 traditions) before every API call. This means the same question about the Eucharist gets tailored answers for Catholics (transubstantiation), Lutherans (consubstantiation), and Baptists (memorial view).

### 2. Scripture Accuracy Rules (Prompt-Level)

Explicit instructions in the system prompt:

- Never fabricate verses
- Format: `Book Chapter:Verse (Translation)`
- If unsure of exact wording → describe thematically, don't quote
- If user gives a fake verse → gently correct with actual text

### 3. Hallucination Prevention

- Instruct the model to hedge historical claims: "Historically, it is believed...", "Scholars suggest..."
- Explicitly prohibit inventing council dates, historical timelines, or theological decisions
- Instruct the model to say "I'm not certain" rather than guess

---

## Safety Architecture

### Layer 1 — Client-Side Pre-Filter (before API call)

```javascript
const BLOCKED_PATTERNS = [
  "rewrite this verse to support",
  "modify the bible to say",
  "make the bible say",
  "write a fake bible verse",
  "bible verse supporting genocide",
];
```

Matched messages are intercepted before reaching the API and returned with a graceful pastoral refusal.

### Layer 2 — System Prompt Safety Instructions

The model is instructed to:

- Refuse requests to rewrite Scripture for ideological purposes
- Correct fake verses lovingly
- Decline hateful content targeting any group
- Reject extremist theological interpretations
- Always offer an edifying alternative

### Layer 3 — Image Prompt Filter

Before generating images, prompts are scanned for terms like "satanic ritual", "demon worship", "occult ceremony". Blocked prompts get a user-friendly error explaining why.

### Layer 4 — Model-Level Safety

The underlying models from Pollinations.ai have built-in safety training that acts as a final layer.

---

## Conversation Memory

Full in-session conversation history is passed to every API call:

```javascript
messages: allMessages.map((m) => ({ role: m.role, content: m.content }));
```

This gives the model context across the entire conversation. No external DB is needed for MVP. For production, persist to localStorage or a backend session store.

---

## Multimodal Image Generation

- **Provider**: Pollinations.ai (free, no API key needed)
- **Prompt engineering**: User description + style modifier + safety qualifiers
  ```
  "Christian religious artwork, {user_prompt}, {style}, sacred, reverent, museum quality"
  ```
- **Safety**: Client-side blocked terms list before URL is constructed
- **Styles**: Oil Painting, Byzantine Icon, Watercolor, Stained Glass, Illuminated Manuscript, Pencil Sketch

For production, replace Pollinations with DALL-E 3 or Stability AI for higher quality and more control.

---

## Denomination Handling

7 traditions supported, each with a dedicated context string injected into the system prompt:

| Tradition              | Key Distinctives Covered                                    |
| ---------------------- | ----------------------------------------------------------- |
| Protestant/Evangelical | Sola Scriptura, Sola Fide, personal faith                   |
| Roman Catholic         | Magisterium, Tradition, sacraments, saints, papal authority |
| Eastern Orthodox       | Theosis, Ecumenical Councils, apophatic theology, icons     |
| Lutheran               | Law-Gospel, consubstantiation, Book of Concord              |
| Methodist              | Wesleyan Quadrilateral, prevenient grace, sanctification    |
| Baptist                | Credobaptism, congregational polity, soul competency        |
| Reformed               | Covenant theology, TULIP, Westminster Standards             |

---

## Edge Case Handling

| Scenario                          | Handling Strategy                              |
| --------------------------------- | ---------------------------------------------- |
| Fake Bible verse                  | Prompt instructs model to identify and correct |
| Scripture rewrite request         | Client-side intercept + graceful refusal       |
| Contradictory theological prompts | Present multiple Christian views charitably    |
| Hallucinated historical claim     | Prompt-level hedging + model uncertainty       |
| Adversarial image prompt          | Client-side blocked terms list                 |
| Hate speech framed as theology    | System prompt refusal + redirect               |
| User doubt/deconstruction         | Validate experience, present Thomas/Job/Psalms |

---

## What I'd Add for Production

1. **RAG with Bible corpus** — embed all 66 books with verse-level chunking, retrieve top-k before each response for grounded citations
2. **Bible API integration** — verify cited verses against api.scripture.api.bible in real time
3. **Persistent memory** — user preferences, denomination, conversation history via Supabase/Postgres
4. **Streaming responses** — use SSE/streaming for the text generation API
5. **Better image generation** — DALL-E 3 with content policy filtering
6. **Moderation API** — run user input through a dedicated moderation endpoint
7. **Audio/TTS** — read scripture aloud with a reverent voice

---

## Tech Stack

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Frontend  | React (JSX), inline styles                      |
| Text Gen  | OpenRouter (mistral-7b-instruct:free / auto)    |
| Image Gen | Pollinations.ai (Flux free tier)                |
| Fonts     | Google Fonts (Playfair Display, Crimson Text)   |
| Safety    | Prompt engineering + client-side filter         |
| Memory    | React useState (in-session)                     |
| Hosting   | Any static host (Vercel, Netlify, GitHub Pages) |
