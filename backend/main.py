import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
import json

# Load environment variables
load_dotenv(".env.local")

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-flash-latest")

class RoadmapStep(BaseModel):
    title: str
    duration: str
    description: str
    detailedExplanation: Optional[str] = None

class ValidationResponse(BaseModel):
    isValidRole: bool
    validationError: Optional[str] = None
    roadmap: Optional[List[RoadmapStep]] = None

class RoadmapRequest(BaseModel):
    jobRole: str
    company: Optional[str] = None
    hoursPerDay: int
    skillLevel: str

@app.post("/api/generate-roadmap", response_model=ValidationResponse)
async def generate_roadmap(request: RoadmapRequest):
    try:
        base_prompt = f"""
        Role: "{request.jobRole}"
        Level: "{request.skillLevel}"
        {f'Target Company/Workplace: "{request.company}"' if request.company else ''}
        Availability: {request.hoursPerDay} hours/day

        Task:
        1. VALIDATION: Check if the parameters are relevant and consistent. 
           - STRICTLY Check if "{request.jobRole}" is a real/valid job role.
           - If a Company is provided ("{request.company}"), check if it is a valid target for this role. 
           - CRITICAL: Verify if the Company ("{request.company}") is actually an educational institution (College, University, Institute).
             - EXAMPLES OF INVALID COMPANIES: "Harvard", "Stanford", "MIT", "IIT", "University of Delhi", "Any College".
             - If the input is a University/College, mark it as INVALID. Students often mistake "Company" for "College".
           
        2. If INVALID, return "isValidRole": false and a "validationError" message explaining why (e.g., "It looks like you entered a college name in the Company field. Please enter a target company or leave it blank.").

        3. If VALID, create a detailed learning roadmap.
           - Calculate realistic node durations based on {request.hoursPerDay} hours/day.

        Output Format (JSON ONLY):
        {{
            "isValidRole": boolean,
            "validationError": "string (optional, only if invalid)",
            "roadmap": [
                {{
                    "title": "Milestone Title",
                    "duration": "Estimated Duration (e.g., '2 weeks' considering {request.hoursPerDay}h/day)",
                    "description": "Brief summary",
                    "detailedExplanation": "Detailed explanation including tools and concepts."
                }}
            ]
        }}
        
        Requirements:
        - 4-6 steps.
        - If Company is known, tailor content to their stack.
        """

        response = model.generate_content(base_prompt)
        text = response.text
        # Clean up JSON
        clean_text = text.replace("```json", "").replace("```", "").strip()
        
        try:
            data = json.loads(clean_text)
            return data
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")

    except Exception as e:
        print(f"Error generating roadmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}
