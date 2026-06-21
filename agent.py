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

def build_prompt(persona: str, code: str) -> str:
    description = PERSONAS[persona]
    return f"""You are a {persona} on a code review panel.

{description}

Review the code below. Return:
- Your stance (approve / changes / block)
- A short "bubble" line (one sentence, spoken like you're at a round table)
- A list of findings, each with title, severity, location, explanation, and suggested fix
- Set round = 0 and responding_to = [] (this is your independent first read)
- Set persona = "{persona}"

Code to review:
```
{code}
```"""

async def run_agent(persona: str, code: str) -> ReviewResponse:
    prompt = build_prompt(persona, code)
    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReviewResponse,
        ),
    )
    return ReviewResponse(**json.loads(response.text))
