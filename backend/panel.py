import asyncio
import os
from dotenv import load_dotenv
from agent import run_agent, PERSONAS
from schema import ReviewResponse

load_dotenv()

def format_transcript(all_rounds: list[list[ReviewResponse]]) -> str:
    lines = []
    for round_reviews in all_rounds:
        if not round_reviews:
            continue
        round_num = round_reviews[0].round
        lines.append(f"\n--- Round {round_num} ---")
        for review in round_reviews:
            lines.append(f"\n[{review.persona}] Stance: {review.stance.upper()}")
            lines.append(f'"{review.bubble}"')
            for finding in review.findings:
                lines.append(f"  - [{finding.severity.upper()}] {finding.title}: {finding.explanation}")
            for arg in review.arguments:
                lines.append(f"  - ARGUMENT: {arg.point} | {arg.reasoning}")
                lines.append(f"    Condition for approval: {arg.condition_for_approval}")
    return "\n".join(lines)

async def safe_run_agent(persona: str, code: str, round_num: int, transcript: str = "", user_argument: str = "") -> ReviewResponse | None:
    try:
        return await run_agent(persona, code, round_num=round_num, transcript=transcript, user_argument=user_argument)
    except Exception as e:
        print(f"  [WARN] {persona} retrying round {round_num} after error: {e}")
    try:
        await asyncio.sleep(2)
        return await run_agent(persona, code, round_num=round_num, transcript=transcript, user_argument=user_argument)
    except Exception as e:
        print(f"  [ERROR] {persona} failed round {round_num}: {e}")
        return None

async def run_panel(code: str) -> list[list[ReviewResponse]]:
    all_rounds = []

    # Round 0: independent reviews
    print("Panel is reviewing your code...\n")
    round_0 = await asyncio.gather(
        *[safe_run_agent(persona, code, round_num=0) for persona in PERSONAS]
    )
    all_rounds.append([r for r in round_0 if r is not None])
    print_results([all_rounds[0]])

    # User counter-argument
    print("\n" + "="*60)
    print("  YOUR TURN — Counter-argue with the panel.")
    print("  Explain your intent, justify your decisions, or push back.")
    print("="*60)
    user_argument = input("\nYour response: ").strip()
    if not user_argument:
        user_argument = "I have no counter-argument at this time."

    # Round 1: agents respond to the user
    print("\nPanel is responding to your argument...\n")
    transcript = format_transcript(all_rounds)
    round_1 = await asyncio.gather(
        *[safe_run_agent(persona, code, round_num=1, transcript=transcript, user_argument=user_argument) for persona in PERSONAS]
    )
    all_rounds.append([r for r in round_1 if r is not None])
    print_results([all_rounds[1]])

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
            for arg in review.arguments:
                print(f"  ARGUES: {arg.point}")
                print(f"  Reasoning: {arg.reasoning}")
                print(f"  Green light if: {arg.condition_for_approval}\n")

async def run_full_review(code: str):
    all_rounds = await run_panel(code)

    from manager import run_manager, format_verdict
    print("\nEngineering Manager is deliberating...\n")
    verdict = await run_manager(all_rounds)
    print(format_verdict(verdict))

if __name__ == "__main__":
    with open("sample_code.py", "r") as f:
        code = f.read()

    asyncio.run(run_full_review(code))
