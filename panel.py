import asyncio
import os
from dotenv import load_dotenv
from agent import run_agent, PERSONAS
from schema import ReviewResponse

load_dotenv()

def format_transcript(all_rounds: list[list[ReviewResponse]]) -> str:
    lines = []
    for round_reviews in all_rounds:
        round_num = round_reviews[0].round
        lines.append(f"\n--- Round {round_num} ---")
        for review in round_reviews:
            lines.append(f"\n[{review.persona}] Stance: {review.stance.upper()}")
            lines.append(f'"{review.bubble}"')
            for finding in review.findings:
                lines.append(f"  - [{finding.severity.upper()}] {finding.title}: {finding.explanation}")
    return "\n".join(lines)

async def run_panel(code: str, num_rounds: int = 2) -> list[list[ReviewResponse]]:
    all_rounds = []

    # Round 0: all three agents review independently, in parallel
    round_0 = await asyncio.gather(
        *[run_agent(persona, code, round_num=0) for persona in PERSONAS]
    )
    all_rounds.append(list(round_0))

    # Debate rounds: each agent sees the full transcript and responds
    for round_num in range(1, num_rounds + 1):
        transcript = format_transcript(all_rounds)
        round_n = await asyncio.gather(
            *[run_agent(persona, code, round_num=round_num, transcript=transcript) for persona in PERSONAS]
        )
        all_rounds.append(list(round_n))

    return all_rounds

def print_results(all_rounds: list[list[ReviewResponse]]) -> None:
    for round_reviews in all_rounds:
        round_num = round_reviews[0].round
        print(f"\n{'#'*60}")
        print(f"  ROUND {round_num} {'(Independent Review)' if round_num == 0 else '(Debate)'}")
        print(f"{'#'*60}")
        for review in round_reviews:
            print(f"\n{'='*50}")
            print(f"  {review.persona} — stance: {review.stance.upper()}")
            print(f"  \"{review.bubble}\"")
            if review.responding_to:
                print(f"  Responding to: {', '.join(review.responding_to)}")
            print(f"{'='*50}")
            for finding in review.findings:
                print(f"  [{finding.severity.upper()}] {finding.title}")
                print(f"  Fix: {finding.suggested_fix}\n")

if __name__ == "__main__":
    with open("sample_code.py", "r") as f:
        code = f.read()

    num_rounds = int(input("How many debate rounds? (1-4, default 2): ") or 2)
    print(f"\nRunning panel with {num_rounds} debate round(s)...\n")

    all_rounds = asyncio.run(run_panel(code, num_rounds))
    print_results(all_rounds)
