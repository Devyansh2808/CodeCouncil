import asyncio
import sys
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from panel import run_panel, format_transcript
from agent import run_agent, PERSONAS
from manager import run_manager
from schema import ReviewResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request/Response models ---

class ReviewRequest(BaseModel):
    code: str

class DebateRequest(BaseModel):
    code: str
    round_0: list[dict]
    user_argument: str

class VerdictRequest(BaseModel):
    all_rounds: list[list[dict]]

# --- Helpers ---

def parse_rounds(raw_rounds: list[list[dict]]) -> list[list[ReviewResponse]]:
    return [[ReviewResponse(**r) for r in round_] for round_ in raw_rounds]

# --- Endpoints ---

@app.post("/api/review")
async def review(req: ReviewRequest):
    """Round 0: independent reviews from all three agents."""
    from panel import safe_run_agent
    results = await asyncio.gather(
        *[safe_run_agent(persona, req.code, round_num=0) for persona in PERSONAS]
    )
    reviews = [r for r in results if r is not None]
    return {"round_0": [r.model_dump() for r in reviews]}

@app.post("/api/debate")
async def debate(req: DebateRequest):
    """Round 1: agents respond to user's counter-argument."""
    from panel import safe_run_agent
    round_0 = [ReviewResponse(**r) for r in req.round_0]
    transcript = format_transcript([round_0])

    results = await asyncio.gather(
        *[safe_run_agent(persona, req.code, round_num=1, transcript=transcript, user_argument=req.user_argument)
          for persona in PERSONAS]
    )
    reviews = [r for r in results if r is not None]
    return {"round_1": [r.model_dump() for r in reviews]}

@app.post("/api/verdict")
async def verdict(req: VerdictRequest):
    """Engineering Manager synthesizes all rounds into a final verdict."""
    all_rounds = parse_rounds(req.all_rounds)
    result = await run_manager(all_rounds)
    return result.model_dump()
