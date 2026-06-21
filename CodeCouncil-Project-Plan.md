# CodeCouncil 🏛️
### A Multi-Agent AI Engineering Review Panel

> *Three AI engineers. One round table. A real verdict on your code.*

**GDG on Campus @ York University — AI Case Competition 2026**
**Target demo: Google Toronto HQ, July 3, 2026**

---

## 1. Elevator Pitch

**CodeCouncil** turns code review into a simulated engineering panel. When you submit a piece of code, three specialized AI personas — a **Backend Engineer**, a **Security Engineer**, and a **Maintainability Architect** — review it independently, then **debate each other in real time around a virtual round table**. You choose how many debate rounds they argue. Finally, an **Engineering Manager** agent weighs the whole discussion and issues a single, actionable verdict: **Approve**, **Approve with changes**, or **Request changes** — with a prioritized fix list a developer can act on immediately.

It's not three chatbots dumping comments. It's a team that *disagrees, concedes, and converges* — exactly like a real review.

---

## 2. The Problem

### Why does this problem exist?

Modern engineering teams ship faster than ever. Continuous deployment, short sprints, and AI-assisted coding mean pull requests pile up at a rate human reviewers cannot sustainably match. The review step — the last line of defense before code reaches production — is where quality silently erodes.

Three failure modes dominate:

1. **Reviews get rushed.** Under deadline pressure, reviewers skim. Logic bugs and edge cases slip through because nobody traced the code path carefully.
2. **Security issues slip through.** A reviewer optimizing for "does it work?" is not simultaneously thinking like an attacker. Injection flaws, unsafe defaults, and leaked secrets pass unnoticed.
3. **Feedback quality decays with fatigue.** The tenth review of the day is not as sharp as the first. Reviewer fatigue is real, measurable, and dangerous.

### Why do existing tools fall short?

Today's automated reviewers (linters, single-shot LLM reviewers, static analyzers) share a blind spot: **they offer one perspective**. A linter sees style. A SAST tool sees known vulnerability signatures. A single LLM prompt produces a flat list of mixed observations with no sense of priority, no resolution of contradictions, and no final decision. None of them capture what makes human panel review valuable — **multiple expert lenses challenging each other until the important issues rise to the top.**

### Problem Statement

> *As shipping velocity rises, code review quality drops. Single-perspective automated tools cannot replicate the multi-disciplinary scrutiny of a human review panel, and they produce unprioritized feedback with no decisive outcome. Developers are left with either slow, fatigued human reviews or shallow, one-dimensional automated ones.*

---

## 3. The Solution

### Solution Statement

> *CodeCouncil is a multi-agent system that simulates a cross-functional engineering review panel. Specialized agents independently evaluate a code submission from distinct expert perspectives, then engage in a structured, user-configurable debate to challenge and refine each other's findings. A coordinating Engineering Manager agent synthesizes the entire discussion into a single, prioritized, actionable review report with a clear merge verdict.*

### What makes it different

| Conventional automated review | CodeCouncil |
|---|---|
| One perspective | Three specialized expert lenses |
| Flat list of observations | Debated, de-duplicated, severity-ranked findings |
| No contradiction handling | Agents concede or escalate; false positives get retracted |
| No decision | A definitive Approve / Changes / Block verdict |
| Static output | A live, visible deliberation the user controls |

---

## 4. The Four Key Questions

### WHY? — Why this matters
Code review is the highest-leverage quality gate in software. Improving it reduces production incidents, security breaches, and technical debt at the cheapest possible point in the lifecycle (before merge). A tool that captures *panel-quality* scrutiny without panel-sized time cost addresses a problem every engineering organization on earth has.

### WHAT? — What we are building
A working multi-agent application with:
- **An input layer** that accepts a code submission (pasted function, uploaded file, or a pull-request diff).
- **Three specialized sub-agents**, each reviewing from a distinct, conflicting perspective.
- **A configurable debate engine** where agents respond to one another across a user-chosen number of rounds.
- **A coordinating Engineering Manager agent** that synthesizes everything into one structured, actionable report.
- **A "round table" UI** that visually presents the three personas deliberating simultaneously, with live stances that change as the debate unfolds.

### WHO? — Who it is for
- **Primary:** Individual developers and small teams who lack the headcount for thorough multi-disciplinary review.
- **Secondary:** Engineering leads who want a fast pre-screen before human review, and educators teaching code-review reasoning.
- **In the demo context:** The GDG judges, who will see a system that is legible at a glance and demonstrably *works*.

### HOW? — How it works (technical flow)
1. User submits code and selects the number of debate rounds (1–4).
2. **Round 0 (Independent Review):** All three agents review the code in parallel. Each returns structured JSON: findings, severities, and an initial stance.
3. **Rounds 1…N (Debate):** Each agent receives the full transcript so far and responds — agreeing, pushing back, conceding, or escalating. Stances may change between rounds.
4. **Synthesis:** The Engineering Manager agent ingests the entire deliberation and produces the final verdict plus a prioritized action list.
5. The UI animates the whole thing as a live round-table discussion.

---

## 5. The Agents (System Design)

### The Panel

**1. Backend Engineer — "Does it actually work?"**
Focus: correctness, logic, edge cases, error handling, API contract design.
Bias: pragmatic; wants working software shipped.

**2. Security Engineer — "Can this be exploited?"**
Focus: injection, unsafe input handling, secrets, authentication/authorization flaws, unsafe defaults.
Bias: cautious; leans toward blocking risky merges. *(Given explicit veto-leaning instructions to guarantee productive conflict.)*

**3. Maintainability Architect — "Can we live with this in six months?"**
Focus: readability, naming, structure, documentation, coupling, long-term technical debt.
Bias: long-term thinking; wants clean, sustainable code.

### The Coordinator

**Engineering Manager — "What do we ship?"**
Reads the entire debate, weighs competing concerns against severity, resolves disagreements, and issues the final verdict with rationale and a prioritized action list. This is the synthesizing/coordinating agent the competition requires.

### Why these three personas
Their incentives **genuinely conflict** — ship fast vs. lock it down vs. refactor first. That built-in tension is what makes the debate produce signal instead of three agents nodding along. It is also instantly legible to anyone watching the demo.

---

## 6. Architecture

```
                    ┌─────────────────────────────┐
                    │   CODE SUBMISSION (input)   │
                    │  paste / file / PR diff     │
                    │  + debate rounds (1–4)      │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
     │ Backend         │  │ Security        │  │ Maintainability │
     │ Engineer        │  │ Engineer        │  │ Architect       │   ◀── ROUND 0
     │ (parallel)      │  │ (parallel)      │  │ (parallel)      │       independent
     └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
              └────────────────────┼────────────────────┘
                                   │  shared transcript
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        each agent sees all prior rounds, responds  ◀── ROUNDS 1…N
        (agree / push back / concede / escalate)        debate loop
              └────────────────────┬────────────────────┘
                                   ▼
                    ┌─────────────────────────────┐
                    │   ENGINEERING MANAGER       │   ◀── SYNTHESIS
                    │   weighs debate → verdict   │
                    └──────────────┬──────────────┘
                                   ▼
                    ┌─────────────────────────────┐
                    │   STRUCTURED REVIEW REPORT  │
                    │   verdict + prioritized list│
                    └─────────────────────────────┘
```

### Data contract (every agent returns structured JSON)
```json
{
  "persona": "Security Engineer",
  "round": 0,
  "stance": "block",            // approve | changes | block
  "bubble": "Short spoken line for the UI",
  "findings": [
    {
      "title": "SQL injection in query builder",
      "severity": "critical",   // critical | high | medium | low
      "location": "line 42",
      "explanation": "User input concatenated directly into SQL.",
      "suggested_fix": "Use parameterized queries."
    }
  ],
  "responding_to": ["Backend Engineer: off-by-one claim"]  // debate rounds only
}
```
Using **Gemini structured output (`response_schema`)** means the app never parses free text — the single biggest reliability lever for a live demo.

---

## 7. Google Technology

**Primary: Gemini API (`gemini-2.x` via the `google-genai` SDK).**

**Why Gemini:**
- **Structured output / JSON schema enforcement** gives every agent a guaranteed, parseable shape — critical for a debate engine that chains agent outputs together. This directly de-risks the live demo.
- **Fast, low-latency models** keep multi-agent, multi-round runs snappy enough to watch in real time.
- **Strong code reasoning** across languages so the personas produce credible, specific findings.
- **Lowest setup overhead** of the accepted Google options for a few-day build under exam constraints, while still leaving room to show real architectural depth.

**Stretch (if time allows):** wrap orchestration in **Google Agent Development Kit (ADK)** to formalize the agents and coordinator, strengthening the "Use of Google technology" score (20%).

---

## 8. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Agent intelligence | Gemini API (`google-genai`) | Required Google tech; structured output |
| Orchestration | Custom async coordinator (optionally ADK) | Parallel round-0; sequential debate loop |
| Frontend / UI | React (single self-contained app) | Full control over the live round-table animation |
| State | In-memory transcript object | No backend DB needed for the demo |
| Input handling | Text paste + file upload (+ optional GitHub diff fetch) | Meets "file / function / PR" requirement |
| Output | Rendered report + exportable Markdown | "Something a real developer could act on" |

---

## 9. The "Round Table" UI

The signature visual. Three persona seats arranged around a table, each showing:
- avatar + role label
- a live status pill (*Reviewing… / Speaking / Agrees / Pushing back*)
- the current speech bubble
- a colored **stance chip** (green Approve / amber Changes / red Block)

The **Engineering Manager** seat sits at the head of the table and lights up only at the end with the verdict.

**Controls:** a debate-rounds slider/stepper (1–4, default 2) lets the user dial scrutiny up or down to their needs.

**The "simultaneous" experience:** within each round the three agents run **genuinely in parallel** (async). The UI shows all three thinking together, then reveals bubbles as calls resolve — real concurrent work, choreographed for clarity.

**The payoff moment to engineer for:** a stance *visibly flipping* between rounds — e.g., Security conceding "Fair point, downgrading from Block to Changes" — its chip changing color live. That single moment is what judges remember.

---

## 10. Build Plan (designed for exam week)

### Phase 0 — Setup (½ day)
- Public GitHub repo (first commit **after June 17, 2026**).
- Gemini API key; `google-genai` installed; one successful structured-output call.
- README scaffold using this document.

### Phase 1 — Single-agent core (1 day)
- Define the JSON schema and one persona prompt.
- Get one agent returning a clean structured review on a planted sample file.

### Phase 2 — The panel, round 0 (1 day)
- Write all three persona prompts.
- Run the three agents in parallel; collect their structured outputs.

### Phase 3 — Debate engine (1 day)
- Implement the round loop: feed transcript-so-far back to each agent.
- Add the rounds parameter (1–4).
- Force convergence in prompts ("if you agree, say so and stop re-arguing").

### Phase 4 — Manager synthesis (½ day)
- Engineering Manager agent → verdict + prioritized action list + exportable Markdown report.

### Phase 5 — Round-table UI (1–1.5 days)
- Three animated seats, status pills, stance chips, rounds slider, manager verdict reveal.

### Phase 6 — Polish & demo prep (1 day)
- Craft the demo input file (one clear vuln + one logic bug + one structure/naming issue) so each persona has something to own and to argue about.
- Record the end-to-end video demo.
- Finalize the one-page written summary.

> **Cut lines if time is short:** PR-diff fetching, ADK wrapper, and 3rd/4th persona are all optional. The guaranteed-working core is *three agents + one debate round + manager verdict*.

---

## 11. Risk Management

| Risk | Mitigation |
|---|---|
| Agents all agree → boring demo | Discrete `stance` field; Security given veto-leaning bias; planted multi-issue demo file |
| Debate rambles / loops | Cap at 4 rounds (default 2); cap findings & bubble length in prompts; "converge and stop" instruction |
| Free-text parsing breaks live | Enforce `response_schema` JSON on every call |
| Latency feels slow on stage | Run round 0 (and each round's three agents) in parallel; keep outputs short |
| API failure mid-demo | Cache a known-good run as a fallback; rehearse on the exact demo file |
| Commits predate window | Fresh repo, first commit after June 17, 2026 |

---

## 12. Mapping to Judging Criteria

| Criterion | Weight | How CodeCouncil scores |
|---|---|---|
| Technical depth & architecture | 35% | Multi-round agent debate with stance evolution + coordinator synthesis — beyond simple fan-out/fan-in |
| Use of Google technology | 20% | Gemini API with enforced structured output; optional ADK orchestration |
| Demo reliability & functionality | 25% | Schema-enforced outputs, parallel execution, cached fallback, rehearsed demo file |
| Real-world applicability | 10% | Produces a prioritized, actionable report with a real merge verdict |
| Clarity of summary & demo | 10% | This document + a legible round-table visual + a clear payoff moment |

---

## 13. What We'd Improve With More Time

- **Real PR integration:** a GitHub App that posts the verdict as a PR check and inline comments.
- **More personas, dynamically chosen:** spin up a Performance or Test-Coverage agent only when relevant to the code.
- **Learning from outcomes:** track which findings developers accept/reject to tune agent priorities.
- **Repo-aware context:** let agents see surrounding files, not just the diff, for deeper reasoning.
- **ADK-native orchestration** with proper tool use (running the code, executing generated tests) for ground-truth findings.
- **Confidence calibration:** have the Manager surface how strongly the panel agreed, not just the verdict.

---

## 14. One-Line Summary (for the submission form)

> **CodeCouncil** is a multi-agent AI review panel where a Backend Engineer, a Security Engineer, and a Maintainability Architect debate your code across a configurable number of rounds — then an Engineering Manager agent synthesizes the discussion into a single, actionable merge verdict. Built on the Gemini API with schema-enforced structured output.
