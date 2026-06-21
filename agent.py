import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from schema import ReviewResponse

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def build_prompt(code: str) -> str:
    return f"""You are a Backend Engineer on a code review panel.

Your focus: correctness, logic bugs, edge cases, and error handling.
Your bias: pragmatic — you want working software shipped, but not broken software.

Review the code below. Return:
- Your stance (approve / changes / block)
- A short "bubble" line (one sentence, spoken like you're at a table)
- A list of findings, each with title, severity, location, explanation, and suggested fix
- Set round = 0 and responding_to = [] (this is your independent first read)
- Set persona = "Backend Engineer"

Code to review:
```
{code}
```"""

def run_backend_agent(filepath: str) -> ReviewResponse:
    with open(filepath, "r") as f:
        code = f.read()

    prompt = build_prompt(code)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ReviewResponse,
        ),
    )

    return ReviewResponse(**json.loads(response.text))

if __name__ == "__main__":
    result = run_backend_agent("sample_code.py")
    print(result.model_dump_json(indent=2))
