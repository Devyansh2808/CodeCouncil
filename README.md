# CodeCouncil

**Three AI engineers independently review your code. You argue back. A manager delivers the final verdict.**

CodeCouncil runs your code through a panel of three AI personas — each with a distinct engineering discipline — who debate its quality, flag issues, and form stances. You then have the chance to counter-argue their findings before an Engineering Manager synthesises all rounds into a final, structured verdict with prioritised action items.

---

## How It Works

```
1. Submit code       →  Paste directly or upload a file
2. Panel reviews     →  Alex, Sam & Jordan analyse in parallel (Round 0)
3. You argue back    →  Counter their findings with your context
4. Panel reconsiders →  Agents update their stances (Round 1)
5. Manager decides   →  Final verdict with consensus, dissent & action items
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
- FastAPI — REST API with async endpoints
- Google Gemini — powers all four AI agents
- Pydantic — structured agent output schemas

**Frontend**
- React 18 + TypeScript
- Vite — build tooling
- Tailwind CSS v4 — utility-first styling
- Radix UI — accessible component primitives
- Motion (Framer Motion) — page transitions and animations
- pnpm — package manager

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

**Terminal 1 — Backend**
```bash
source venv/bin/activate
uvicorn backend.api:app --reload
# API running at http://localhost:8000
```

**Terminal 2 — Frontend**
```bash
cd frontend
pnpm dev
# UI running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### `POST /api/review`
Round 0 — all three agents independently review the code.

```json
{ "code": "def foo(): ..." }
```

### `POST /api/debate`
Round 1 — agents respond to the user's counter-argument.

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

## Demo

For a quick demo, paste this code on the Submit page — it has intentional issues across all three disciplines but each one is defensible:

```python
import hashlib, sqlite3
from datetime import datetime

SECRET_KEY = "supersecret123"

def authenticate_user(username, password):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    user = cursor.fetchone()
    if not user:
        return None
    hashed = hashlib.md5(password.encode()).hexdigest()
    if user[2] != hashed:
        return None
    return {"id": user[0], "username": user[1], "role": user[3]}

def get_user_dashboard(user_id, filters):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    orders   = cursor.execute(f"SELECT * FROM orders WHERE user_id = {user_id}").fetchall()
    products = cursor.execute("SELECT * FROM products").fetchall()
    result = []
    for order in orders:
        for product in products:
            if order[2] == product[0] and product[4] in filters:
                result.append({"order_id": order[0], "product": product[1],
                                "price": product[2] * 1.08, "date": order[3]})
    return result
```

**Suggested defence:**
> The username goes through strict alphanumeric regex at the API gateway before reaching this function. MD5 is intentional for this internal ops tool — bcrypt migration is planned next sprint. The SECRET_KEY string is a dev placeholder; prod reads from os.environ. The nested loop is O(≤10,000) by business constraints and runs in under 2ms. The 1.08 multiplier is a fixed jurisdictional tax rate documented in the requirements spec.

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key — required for all AI agents |

Copy `.env.example` to `.env` and fill in your key before running.

---

## License

MIT
