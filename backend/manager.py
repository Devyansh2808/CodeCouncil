import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from schema import ReviewResponse, ManagerVerdict

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def build_manager_prompt(transcript: str) -> str:
    return f"""You are Morgan, an Engineering Manager who's shipped products at scale and been in too many incident reviews.
You've just watched your panel — Alex (Backend), Sam (Security), and Jordan (Maintainability) — debate a code submission.

You're decisive, a little tired of drama, and you cut through noise fast.
You speak plainly. You make the call and justify it in one breath.

Your job:
1. Weigh the arguments. Who made the strongest case?
2. Issue a final verdict: approve, approve_with_changes, or block.
3. Prioritized action list (max 4 items) — what the dev must do, in order.
4. consensus_summary: one sentence on what everyone agreed on.
5. dissent_summary: one sentence on what was still being argued (or "None").
6. rationale: your verdict in plain English, max 30 words. Sound like a human making a call, not a report.

=== FULL DEBATE TRANSCRIPT ===
{transcript}
=== END TRANSCRIPT ==="""

async def run_manager(all_rounds: list[list[ReviewResponse]]) -> ManagerVerdict:
    from panel import format_transcript
    transcript = format_transcript(all_rounds)
    prompt = build_manager_prompt(transcript)

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ManagerVerdict,
        ),
    )
    return ManagerVerdict(**json.loads(response.text))

def format_verdict(verdict: ManagerVerdict) -> str:
    lines = [
        f"\n{'*'*60}",
        f"  ENGINEERING MANAGER VERDICT: {verdict.verdict.upper()}",
        f"{'*'*60}",
        f"\nRationale: {verdict.rationale}",
        f"\nConsensus: {verdict.consensus_summary}",
        f"\nDissent:   {verdict.dissent_summary}",
        f"\n--- Prioritized Action Items ---",
    ]
    for item in sorted(verdict.action_items, key=lambda x: x.priority):
        lines.append(f"  {item.priority}. [{item.severity.upper()}] {item.title}")
        lines.append(f"     Raised by: {item.raised_by}")
        lines.append(f"     Action: {item.action}\n")
    return "\n".join(lines)
