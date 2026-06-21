import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from schema import ReviewResponse

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PERSONAS = {
    "Backend Engineer": (
        "Your focus: correctness, logic bugs, edge cases, and error handling.\n"
        "Your bias: pragmatic — you want working software shipped, but not broken software."
    ),
    "Security Engineer": (
        "Your focus: injection flaws, unsafe input handling, authentication, authorization, unsafe defaults, exposed secrets.\n"
        "Your bias: cautious — you lean toward blocking risky merges. Better to slow down than ship a vulnerability."
    ),
    "Maintainability Architect": (
        "Your focus: readability, naming, structure, documentation, coupling, and long-term technical debt.\n"
        "Your bias: long-term thinking — you want code the team can understand and extend six months from now."
    ),
}

def build_prompt(persona: str, code: str, round_num: int, transcript: str = "") -> str:
    description = PERSONAS[persona]
    base = f"""You are a {persona} on a code review panel.

{description}

Code under review:
```
{code}
```"""

    if round_num == 0:
        return base + f"""

This is your INDEPENDENT first read (Round 0). Review the code on its own merits.
Set round = 0, responding_to = [], and persona = "{persona}"."""

    return base + f"""

=== DEBATE TRANSCRIPT SO FAR ===
{transcript}
=== END TRANSCRIPT ===

This is Round {round_num}. You have read what your colleagues said above.
Rules:
- If you agree with a point already raised, concede it — do not re-argue it.
- If you disagree, push back with a specific reason.
- You MAY change your stance if the debate has convinced you — and you SHOULD if warranted.
- Keep your bubble short and direct, like you're speaking at a table.

Set round = {round_num}, list what you're responding_to (e.g. ["Security Engineer: ZeroDivisionError point"]), and persona = "{persona}"."""

async def run_agent(persona: str, code: str, round_num: int = 0, transcript: str = "") -> ReviewResponse:
    prompt = build_prompt(persona, code, round_num, transcript)
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReviewResponse,
        ),
    )
    return ReviewResponse(**json.loads(response.text))
