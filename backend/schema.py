from pydantic import BaseModel
from typing import Literal, List

class Finding(BaseModel):
    title: str
    severity: Literal["low", "medium", "high", "critical"]
    location: str
    explanation: str
    suggested_fix: str

class Argument(BaseModel):
    point: str
    reasoning: str
    condition_for_approval: str

class ReviewResponse(BaseModel):
    persona: str
    round: int
    stance: Literal["approve", "changes", "block"]
    bubble: str
    findings: List[Finding] = []
    arguments: List[Argument] = []
    responding_to: List[str] = []

class ActionItem(BaseModel):
    priority: int
    title: str
    severity: Literal["low", "medium", "high", "critical"]
    raised_by: str
    action: str

class ManagerVerdict(BaseModel):
    verdict: Literal["approve", "approve_with_changes", "block"]
    rationale: str
    consensus_summary: str
    dissent_summary: str
    action_items: List[ActionItem]