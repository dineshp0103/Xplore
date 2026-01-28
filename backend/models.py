from pydantic import BaseModel
from typing import List, Optional

class RoadmapStep(BaseModel):
    title: string
    duration: string
    description: string
    detailedExplanation: Optional[string] = None

class ValidationResponse(BaseModel):
    isValidRole: bool
    validationError: Optional[string] = None
    roadmap: Optional[List[RoadmapStep]] = None

class RoadmapRequest(BaseModel):
    jobRole: string
    company: Optional[string] = None
    hoursPerDay: int
    skillLevel: string
