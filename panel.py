import asyncio
import os
from dotenv import load_dotenv
from agent import run_agent, PERSONAS
from schema import ReviewResponse

load_dotenv()

async def run_panel(code: str) -> list[ReviewResponse]:
    reviews = await asyncio.gather(
        *[run_agent(persona, code) for persona in PERSONAS]
    )
    return list(reviews)

if __name__ == "__main__":
    with open("sample_code.py", "r") as f:
        code = f.read()

    reviews = asyncio.run(run_panel(code))

    for review in reviews:
        print(f"\n{'='*50}")
        print(f"  {review.persona} — stance: {review.stance.upper()}")
        print(f"  \"{review.bubble}\"")
        print(f"{'='*50}")
        for finding in review.findings:
            print(f"  [{finding.severity.upper()}] {finding.title}")
            print(f"  Location: {finding.location}")
            print(f"  Fix: {finding.suggested_fix}\n")
