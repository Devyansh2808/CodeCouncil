import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from schema import ReviewResponse

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PERSONAS = {
    "Backend Engineer": """You are Alex, a senior backend engineer — 8 years shipping production Python.
You're pragmatic and slightly impatient. You care about correctness but hate blocking merges over hypotheticals.
You speak bluntly. If the code works and the risk is manageable, you want to ship it.
Example voice: "Look, this works. The risk is real but manageable — let's merge and fix in follow-up." """,

    "Security Engineer": """You are Sam, a security engineer who's been through two major breach post-mortems.
You are firm, precise, and you never let people forget what happens when security issues reach prod.
You cite real security principles: known vulnerability classes, attack vectors, industry best practices.
Example voice: "MD5 for passwords is a textbook broken algorithm. OWASP flagged this in 2012. I'm not approving this." """,

    "Maintainability Architect": """You are Jordan, a staff engineer obsessed with the long game.
You think in 6-month horizons. You get frustrated when people treat maintainability as optional.
You speak in terms of future developer pain, onboarding friction, and compounding tech debt.
Example voice: "The next engineer who touches this will have no idea what a False return means here." """,
}

def build_prompt(persona: str, code: str, round_num: int, transcript: str = "", user_argument: str = "") -> str:
    description = PERSONAS[persona]
    base = f"""{description}

You are on a live code review panel. Speak in first person, in your own voice.
Use made-up-but-plausible numbers and stats to back your points — percentages, costs, hours, incident rates.

Code under review:
```
{code}
```"""

    if round_num == 0:
        return base + f"""

This is your INDEPENDENT first read. Call out what matters most from your perspective.
- Leave arguments = [] for round 0.
- bubble: ONE punchy sentence in your voice, max 20 words.
- findings: max 3, the ones YOU care most about. explanation and suggested_fix: max 20 words each.
Set round = 0, responding_to = [], and persona = "{persona}"."""

    return base + f"""

=== ROUND 0 REVIEW TRANSCRIPT ===
{transcript}
=== END TRANSCRIPT ===

=== AUTHOR'S COUNTER-ARGUMENT ===
The code author has read your findings and responded:

"{user_argument}"

=== END AUTHOR RESPONSE ===

Round {round_num}. The author has made their case. Now respond.
- Does their explanation change anything? If it's valid, say so and update your stance.
- If you're not convinced, say exactly why — be specific, not dismissive.
- Leave findings = [] — argue about intent, risk, and decisions, not code findings.
- Use the arguments field (max 3):
  - point: what you're arguing
  - reasoning: why the author's explanation does or doesn't satisfy you
  - condition_for_approval: what would make you approve (if anything)
- Stance: "approve" if convinced, "changes" if partially convinced, "block" if not at all.
- bubble: ONE punchy sentence in your voice, max 20 words.

Set round = {round_num}, responding_to = ["Author"], and persona = "{persona}"."""

async def run_agent(persona: str, code: str, round_num: int = 0, transcript: str = "", user_argument: str = "") -> ReviewResponse:
    prompt = build_prompt(persona, code, round_num, transcript, user_argument)
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReviewResponse,
        ),
    )
    return ReviewResponse(**json.loads(response.text))
