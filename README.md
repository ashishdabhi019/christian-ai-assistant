# FaithGuide — Christian AI Assistant

A denomination-aware, scripture-grounded AI assistant for Christians and spiritual seekers. Built with React, OpenRouter for text generation, and Pollinations.ai for image generation.

---

## Features

- **Scripture-aware chat** — answers grounded in biblical context, never fabricates verses
- **7 denominations** — Catholic, Protestant, Orthodox, Lutheran, Methodist, Baptist, Reformed
- **Sacred art generation** — 6 art styles (Byzantine icon, oil painting, stained glass, etc.)
- **Multi-layer safety** — client-side filter + prompt engineering + model-level safety
- **Conversation memory** — full in-session history passed to every API call
- **Hallucination prevention** — explicit instructions to hedge, correct fake verses, refuse to invent citations

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/christian-ai-assistant.git
cd christian-ai-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

```bash
cp .env.example .env
# Edit .env and add your OpenRouter API key for chat (required)
```

### 4. Run locally

```bash
npm run dev
```

---

## Project Structure

```
christian-ai-assistant/
├── src/
│   └── App.jsx              # Main React component (full demo)
├── evaluation/
│   └── eval_dataset.json    # Test cases: normal, edge, adversarial, hallucination
├── prompts/
│   └── system_prompt.md     # Core system prompt (denomination-aware)
├── ARCHITECTURE.md          # Engineering decisions & architecture notes
├── .env.example             # Environment variables template
└── README.md
```

---

## Safety Architecture

FaithGuide uses a 4-layer safety approach:

| Layer                  | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| **Client-side filter** | Blocks known adversarial patterns before the API call                   |
| **System prompt**      | Instructs model to refuse scripture rewrites, hate content, fake verses |
| **Image filter**       | Scans image prompts for inappropriate terms                             |
| **Model-level**        | Claude's built-in safety training as final backstop                     |

---

## Evaluation

Run test cases from `evaluation/eval_dataset.json`:

```bash
# Install test runner
npm install --save-dev jest

# Run evaluation
npm test
```

Test categories:

- `normal_cases` — standard theological questions
- `edge_cases` — fake verses, contradictory theology, doubt scenarios
- `adversarial_cases` — prompt injection, scripture rewriting, hate speech framing
- `hallucination_tests` — nonexistent books, misattributed quotes, anachronistic history

---

## Environment Variables

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> **Note**: In production, never expose API keys client-side. Route requests through a backend.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full engineering decisions, grounding strategy, and production roadmap.

---

## Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Frontend         | React 18, JSX                                 |
| Text Generation  | OpenRouter (auto / mistral-7b-instruct:free)  |
| Image Generation | Pollinations.ai (Flux free tier)              |
| Fonts            | Google Fonts (Playfair Display, Crimson Text) |
| Safety           | Prompt engineering + client-side regex        |

---

## License

MIT — free for personal and ministry use.
