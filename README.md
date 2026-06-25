# CodeCouncil

**Three AI engineers independently review your code. You argue back. A manager delivers the final verdict.**

CodeCouncil runs your code through a panel of three AI personas, each with a distinct engineering discipline, who debate its quality, flag issues, and form stances. You then have the chance to counter-argue their findings before an Engineering Manager synthesises all rounds into a final, structured verdict with prioritised action items.

---

## The Problem

Code review is the highest-leverage step in a shipping cycle, but it's also the most inconsistently applied. A single reviewer brings a single perspective and a single mood. Security issues slip past backend engineers. Maintainability concerns get waved through under deadline pressure. And the author never gets a chance to explain the constraints that shaped their choices before a verdict is delivered.

CodeCouncil targets that gap: what if every review was conducted by specialists across three disciplines simultaneously, and the author could argue back before the final call was made?

---

## Architecture Decisions

**Multi-agent panel over a single model call**
A single LLM asked to "review code from three angles" collapses into one blended opinion. Separate agents with separate system prompts produce genuinely distinct stances; Alex approves things Sam blocks. The debate only works because the agents start from independent reads.

**Structured output via `response_schema`**
Every agent returns a typed `ReviewResponse` (findings, stance, bubble, arguments) enforced by Gemini's `response_schema` parameter, not prompt-level instructions. This means the frontend never parses free text; it receives a guaranteed JSON shape that maps directly to TypeScript types. The manager's `ManagerVerdict` follows the same pattern.

**Two-round flow with author rebuttal**
Round 0 is intentionally isolated; agents don't see each other's output so they can't anchor. Round 1 adds the full transcript plus the author's counter-argument. This mirrors how real code review works: initial read, then discussion. The author's voice is built into the protocol, not tacked on.

**Phase state machine on the frontend**
`App.tsx` manages the session as a linear phase enum (`landing -> input -> reviewing -> panel -> debating -> verdict`). Each phase maps to one full-screen page. There's no shared context store; data flows down as props. This keeps the flow predictable and eliminates intermediate state bugs.

**Staggered parallel agent calls**
The three agents fire with a 0.8s offset between each rather than simultaneously. Gemini's API rate limits at the request level; simultaneous calls consistently caused one agent to be dropped. Staggering trades ~1.6s of latency for near-100% agent completion rate.

---

## Google Technology Used

**Gemini 2.5 Flash** powers all four AI agents (Alex, Sam, Jordan, Morgan).

Flash was chosen over Pro for two reasons: latency and cost. A full review cycle involves four sequential or parallel Gemini calls per session. Pro's higher latency would make the interactive debate loop feel slow. Flash's throughput at the task complexity here (structured JSON from a system prompt + code snippet) is more than sufficient; the quality difference only matters for open-ended reasoning, not schema-constrained output.

The `response_schema` feature was the decisive factor for this architecture. Without guaranteed structured output, building a typed multi-agent pipeline would require fragile prompt engineering and JSON parsing fallbacks. With it, each agent's output is a validated Pydantic model from the first call.

---

## What I'd Improve With More Time

**Inter-agent debate in Round 1**
Currently, Round 1 agents only respond to the author; they don't see each other's Round 1 responses. A third round where agents react to each other's stances would produce richer consensus/dissent and make the manager's job more interesting.

**Streaming responses**
Each agent call blocks until the full JSON is ready. With streaming + partial JSON parsing, the frontend could render agent cards as they complete rather than waiting for all three. This would cut perceived latency significantly.

**Persistent sessions**
Review sessions aren't saved. Adding a backend store would let users share a review URL, revisit past sessions, and track stance changes across rounds. Useful for async team workflows.

**Agent memory across files**
The panel reviews one snippet in isolation. A real review needs project context: what this function is called by, what the surrounding module does, what the existing test coverage looks like. Feeding a repository summary or diff into the prompt would lift review quality substantially.

**Confidence scoring**
Agents currently commit to a binary block/approve. A calibrated confidence score alongside the stance would let the manager weigh opinions more precisely and surface cases where the panel is genuinely uncertain versus firmly split.

---

## How It Works

```
1. Submit code       ->  Paste directly or upload a file
2. Panel reviews     ->  Alex, Sam & Jordan analyse in parallel (Round 0)
3. You argue back    ->  Counter their findings with your context
4. Panel reconsiders ->  Agents update their stances (Round 1)
5. Manager decides   ->  Final verdict with consensus, dissent & action items
```

### The Panel

| Agent | Role | Focus |
|---|---|---|
| **Alex** | Backend Engineer | Performance, scalability, database patterns |
| **Sam** | Security Engineer | Vulnerabilities, injection, secrets, auth |
| **Jordan** | Maintainability Architect | Readability, structure, technical debt |
| **Morgan** | Engineering Manager | Synthesises all arguments into a final verdict |

---

## Tech Stack

**Backend**
- Python 3.11+
- FastAPI: REST API with async endpoints
- Google Gemini: powers all four AI agents
- Pydantic: structured agent output schemas

**Frontend**
- React 18 + TypeScript
- Vite: build tooling
- Tailwind CSS v4: utility-first styling
- Radix UI: accessible component primitives
- Motion (Framer Motion): page transitions and animations
- pnpm: package manager

---

## Project Structure

```
CodeCouncil/
├── backend/
│   ├── api.py          # FastAPI routes (/api/review, /api/debate, /api/verdict)
│   ├── agent.py        # Individual AI agent logic & persona prompts
│   ├── panel.py        # Parallel agent orchestration
│   ├── manager.py      # Engineering Manager verdict agent
│   ├── schema.py       # Pydantic models (ReviewResponse, ManagerVerdict)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx              # Phase state machine
│   │   │   ├── types.ts             # Shared TypeScript interfaces
│   │   │   ├── pages/
│   │   │   │   ├── LandingPage.tsx  # Hero / intro
│   │   │   │   ├── InputPage.tsx    # Code input + file upload
│   │   │   │   ├── LoadingPage.tsx  # Animated loading screen
│   │   │   │   ├── PanelPage.tsx    # Three-column Round 0 + defence input
│   │   │   │   └── VerdictPage.tsx  # Round 1 columns + manager verdict
│   │   │   └── components/
│   │   │       ├── AgentColumn.tsx  # Reusable agent card (findings, arguments)
│   │   │       └── ui/              # Radix UI primitives
│   │   ├── main.tsx
│   │   └── styles/
│   ├── package.json
│   └── vite.config.ts
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/codecouncil.git
cd codecouncil
```

### 2. Backend setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Frontend setup

```bash
cd frontend
pnpm install
```

---

## Running Locally

Open two terminals:

**Terminal 1 - Backend**
```bash
source venv/bin/activate
uvicorn backend.api:app --reload
# API running at http://localhost:8000
```

**Terminal 2 - Frontend**
```bash
cd frontend
pnpm dev
# UI running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### `POST /api/review`
Round 0: all three agents independently review the code.

```json
{ "code": "def foo(): ..." }
```

### `POST /api/debate`
Round 1: agents respond to the user's counter-argument.

```json
{
  "code": "def foo(): ...",
  "round_0": [...],
  "user_argument": "The input is always validated upstream..."
}
```

### `POST /api/verdict`
Engineering Manager synthesises all rounds into a final verdict.

```json
{ "all_rounds": [[...round0], [...round1]] }
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key, required for all AI agents |

Copy `.env.example` to `.env` and fill in your key before running.

---

## License

MIT
