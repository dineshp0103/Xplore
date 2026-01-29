import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
import json
import hashlib
from supabase import create_client, Client

# Load environment variables
load_dotenv(".env.local")

app = FastAPI()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)
# Default model for roadmap generation
roadmap_model = genai.GenerativeModel("gemini-flash-latest")

# Configure Supabase for Caching
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("Supabase client initialized for caching.")
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")
else:
    print("Warning: Supabase credentials not found. Caching will be disabled.")

# Chat model with system instruction
chat_system_instruction = """
You are Xplore AI, a professional Career Mentor and Tech Trainer.
Your goal is to help users understand their generated career roadmaps and explain technical concepts in depth.

RULES:
1.  **Fact-Based Only**: You must provide only verified, factual information. If you are unsure, admit it. Do not hallucinate.
2.  **Context Aware**: The user might ask about specific steps in their roadmap. Use the provided context.
3.  **Mentor Persona**: Be encouraging, professional, and structured. Use headings and bullet points.
4.  **No Fluff**: Keep answers concise but comprehensive.
5.  **Strictly Tech/Career Focused**: Do not answer questions unrelated to technology, careers, or learning.
"""
chat_model = genai.GenerativeModel(
    "gemini-flash-latest",
    system_instruction=chat_system_instruction
)
# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pdinesh0103.github.io",
    "https://dineshp0103.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Construct chat history for Gemini
        history = []
        for msg in request.history:
             # Map 'ai' role to 'model' for Gemini
            role = "model" if msg.role == "ai" else "user"
            history.append({"role": role, "parts": [msg.content]})

        chat = chat_model.start_chat(history=history)
        
        response = chat.send_message(request.message)
        return {"response": response.text}

    except Exception as e:
        print(f"Error in chat: {e}")
        error_msg = str(e)
        status_code = 500
        if "429" in error_msg:
            status_code = 429
            error_msg = "Gemini API Quota Exceeded. Please wait a moment."
        raise HTTPException(status_code=status_code, detail=error_msg)

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

def generate_params_hash(role: str, company: Optional[str], hours: int, level: str) -> str:
    # Normalize inputs
    role = role.lower().strip()
    company = company.lower().strip() if company else ""
    hours = str(hours)
    level = level.lower().strip()
    
    # Create a unique string
    raw = f"{role}|{company}|{hours}|{level}"
    return hashlib.md5(raw.encode()).hexdigest()

@app.post("/api/generate-roadmap", response_model=ValidationResponse)
async def generate_roadmap(request: RoadmapRequest):
    # 1. Check Cache
    params_hash = generate_params_hash(request.jobRole, request.company, request.hoursPerDay, request.skillLevel)
    
    if supabase:
        try:
            # Check roadmap_cache table
            cache_response = supabase.table("roadmap_cache").select("data").eq("params_hash", params_hash).execute()
            if cache_response.data and len(cache_response.data) > 0:
                print("Serving roadmap from Backend Cache")
                cached_data = cache_response.data[0]["data"]
                return cached_data
        except Exception as e:
            print(f"Cache lookup failed: {e}")

    # 2. Generate if not in cache
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

        response = roadmap_model.generate_content(base_prompt)
        text = response.text
        # Clean up JSON
        clean_text = text.replace("```json", "").replace("```", "").strip()
        
        try:
            data = json.loads(clean_text)
            
            # 3. Store in Cache (if valid and supabase is available)
            if supabase and data.get("isValidRole"):
                try:
                    supabase.table("roadmap_cache").insert({
                        "params_hash": params_hash,
                        "data": data
                    }).execute()
                    print("Saved roadmap to Backend Cache")
                except Exception as e:
                    print(f"Failed to save to cache: {e}")
            
            return data
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")

    except Exception as e:
        print(f"Error generating roadmap: {e}")
        error_msg = str(e)
        status_code = 500
        if "429" in error_msg:
            status_code = 429
            error_msg = "Gemini API Quota Exceeded. Please wait a moment."
        raise HTTPException(status_code=status_code, detail=error_msg)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
