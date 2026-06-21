from pydantic import BaseModel
from typing import Literal, List

class Finding(BaseModel):
      title: str
      severity: Literal["low", "medium", "high", "critical"]   
      location: str
      explanation: str
      suggested_fix: str

class ReviewResponse(BaseModel):
      persona: str
      round: int
      stance: Literal["approve", "changes", "block"]          
      bubble: str
      findings: List[Finding]                     
      responding_to: List[str]