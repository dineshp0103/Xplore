import os
import re
from google import genai
from google.genai import types
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import json
import hashlib
from openai import OpenAI
import jwt

# Load environment variables
load_dotenv(".env.local")

app = FastAPI()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

# Initialize the new genai client
client = genai.Client(api_key=api_key.strip() if api_key else None)
MODEL_NAME = "gemini-2.5-flash"

# Configure OpenAI (Fallback)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = None
if openai_api_key:
    openai_client = OpenAI(api_key=openai_api_key.strip())
    print("OpenAI client initialized for fallback.")
else:
    print("Warning: OPENAI_API_KEY not found. Fallback disabled.")

# JWT Configuration
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not SUPABASE_JWT_SECRET:
    print("Warning: SUPABASE_JWT_SECRET not set. Auth verification will fail.")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verifies the Supabase JWT token."""
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT Secret not configured")

    token = credentials.credentials
    try:
        # Supabase uses HS256 by default
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_ai_content(prompt: str, system_instruction: str = "", history: List[Dict[str, str]] = None) -> str:
    """
    Tries to generate content using Gemini 2.5 Flash.
    If it fails (quota exceeded/error), falls back to OpenAI (gpt-4o-mini or gpt-3.5-turbo).
    """
    # 1. Try Gemini
    try:
        if history:
            # Chat mode
            gemini_contents = []
            for msg in history:
                role = "model" if msg["role"] == "assistant" or msg["role"] == "ai" else "user"
                gemini_contents.append(types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg["content"])]
                ))
            # Add current prompt
            gemini_contents.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            ))
            
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=gemini_contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                )
            )
        else:
            # Direct prompt mode
            full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=full_prompt
            )
        
        return response.text

    except Exception as e:
        print(f"Gemini generation failed: {e}")
        error_msg = str(e)
        
        # Trigger fallback on ANY error (Quota, Server, Timeout, etc.)
        if openai_client:
            print(f"Gemini failed ({error_msg}). Falling back to OpenAI...")
            try:
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                
                if history:
                    messages.extend(history)
                
                messages.append({"role": "user", "content": prompt})

                completion = openai_client.chat.completions.create(
                    model="gpt-4o-mini", # Efficient and fast model
                    messages=messages,
                    store=True
                )
                return completion.choices[0].message.content
            except Exception as oe:
                print(f"OpenAI fallback failed: {oe}")
                # Raise original error if fallback also fails
                raise e
        else:
             print("OpenAI fallback unavailable (no key).")
             raise e

# Configure Supabase for Caching/Storage
# First check if supabase package is available
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("Supabase package not installed. Caching will be disabled.")

supabase_client = None
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if SUPABASE_AVAILABLE and supabase_url and supabase_key:
    try:
        supabase_client = create_client(supabase_url, supabase_key)
        print("Supabase client initialized.")
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")
else:
    if not SUPABASE_AVAILABLE:
        print("Supabase caching disabled (package not installed).")
    else:
        print("Warning: Supabase credentials not found. Caching will be disabled.")


# Chat model system instruction
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

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dineshp0103.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"], # Added Authorization
)


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user: dict = Depends(verify_token)): # Protected
    try:
        # Prepare history for helper
        formatted_history = []
        for msg in request.history:
            role = "assistant" if msg.role == "ai" else "user"
            formatted_history.append({"role": role, "content": msg.content})

        response_text = generate_ai_content(
            prompt=request.message,
            system_instruction=chat_system_instruction,
            history=formatted_history
        )
        
        return {"response": response_text}

    except Exception as e:
        print(f"Error in chat: {e}")
        error_msg = str(e)
        status_code = 500
        if "429" in error_msg:
            status_code = 429
            error_msg = "Gemini API Quota Exceeded. Please wait a moment."
        raise HTTPException(status_code=status_code, detail=error_msg)

class Resource(BaseModel):
    title: str
    type: str  # "video" | "article" | "course" | "documentation"
    url: str

class RoadmapStep(BaseModel):
    id: str = "step-0"
    title: str = "Step"
    duration: str = "1 week"
    description: str = ""
    detailedExplanation: str = ""
    resources: List[Resource] = []
    dependencies: List[str] = []

class CapstoneProject(BaseModel):
    title: str = "Project"
    description: str = ""
    difficulty: str = "Intermediate"
    keyFeatures: List[str] = []
    techStack: List[str] = []

class ValidationResponse(BaseModel):
    isValidRole: bool
    validationError: Optional[str] = None
    roadmap: Optional[List[RoadmapStep]] = None
    suggestedProject: Optional[CapstoneProject] = None

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
async def generate_roadmap(request: RoadmapRequest, user: dict = Depends(verify_token)): # Protected
    # 1. Check Cache
    params_hash = generate_params_hash(request.jobRole, request.company, request.hoursPerDay, request.skillLevel)
    
    if supabase_client:
        try:
            # Check roadmap_cache table
            cache_response = supabase_client.table("roadmap_cache").select("data").eq("params_hash", params_hash).execute()
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
           
        2. If INVALID, return "isValidRole": false and a "validationError" message explaining why.

        3. If VALID, create a detailed learning roadmap AND a Capstone Project.
           - Calculate realistic node durations based on {request.hoursPerDay} hours/day.
           - DEFINE DEPENDENCIES: Steps can depend on previous steps. Use "dependencies" field.

        Output Format (JSON ONLY):
        {{
            "isValidRole": boolean,
            "validationError": "string (optional)",
            "roadmap": [
                {{
                    "id": "step-1",
                    "title": "Topic Name",
                    "duration": "e.g., 2 weeks",
                    "description": "Short summary",
                    "detailedExplanation": "Deep dive...",
                    "resources": [ "{{ ... }}" ],
                    "dependencies": ["step-0"] (Optional, IDs of prerequisite steps)
                }}
            ],
            "suggestedProject": {{ ... }}
        }}
        
        Requirements:
        - Generate **7-10 detailed steps** (Phases).
        - Ensure a logical flow. Some steps can run in parallel if they don't depend on each other.
        - For 'resources', provide 2-3 REAL, high-quality links.
        - The project must be RELEVANT to the "{request.company}" if provided.
        - IMPORTANT: Assign unique IDs like "step-0", "step-1" to each step and use them in "dependencies".
        """

        response_text = generate_ai_content(
            prompt=base_prompt
        )
        text = response_text
        print(f"Raw AI Response (first 500 chars): {text[:500]}...")
        
        # Clean up JSON - try multiple approaches
        clean_text = text.replace("```json", "").replace("```", "").strip()
        
        # Try to extract JSON object using regex as fallback
        json_match = re.search(r'\{[\s\S]*\}', clean_text)
        if json_match:
            clean_text = json_match.group(0)
        
        try:
            data = json.loads(clean_text)
            
            # 3. Store in Cache (if valid and supabase is available)
            if supabase_client and data.get("isValidRole"):
                try:
                    supabase_client.table("roadmap_cache").insert({
                        "params_hash": params_hash,
                        "data": data
                    }).execute()
                    print("Saved roadmap to Backend Cache")
                except Exception as e:
                    print(f"Failed to save to cache: {e}")
            
            return data
        except json.JSONDecodeError as je:
            print(f"JSON Parse Error: {je}")
            print(f"Attempted to parse: {clean_text[:1000]}...")
            raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(je)}")

    except Exception as e:
        print(f"Error generating roadmap: {e}")
        error_msg = str(e)
        status_code = 500
        if "429" in error_msg:
            status_code = 429
            error_msg = "Gemini API Quota Exceeded. Please wait a moment."
        raise HTTPException(status_code=status_code, detail=error_msg)

class ProjectVerificationRequest(BaseModel):
    github_url: str
    project_description: Optional[str] = ""

class ProjectVerificationResponse(BaseModel):
    verified: bool
    confidence_score: float
    feedback: str
    xp_awarded: int

@app.post("/api/verify-project", response_model=ProjectVerificationResponse)
async def verify_project(request: ProjectVerificationRequest, user: dict = Depends(verify_token)):
    # 1. Sanitize input
    if not re.match(r"^https://github\.com/[a-zA-Z0-9-]+/[a-zA-Z0-9-_]+$", request.github_url):
         raise HTTPException(status_code=400, detail="Invalid GitHub URL format. Must be https://github.com/username/repo")
    
    # 2. AI Verification
    prompt = f"""
    Verify this project submission.
    GitHub URL: {request.github_url}
    User Description: {request.project_description}

    Task:
    1. Assess if this looks like a valid project submission for a coding roadmap.
    2. Provide a confidence score (0.0 to 1.0).
    3. Provide brief feedback.
    
    Output Format (JSON):
    {{
        "verified": boolean,
        "confidence_score": float,
        "feedback": "string",
        "xp_awarded": int (suggest 50-100 based on quality)
    }}
    """
    
    try:
        response_text = generate_ai_content(prompt=prompt)
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        # Log activity
        if supabase_client and data.get("verified"):
            try:
                supabase_client.table("user_activity").insert({
                    "user_id": user["sub"], # Supabase JWT has 'sub' as user_id
                    "activity_type": "project_verified",
                    "xp_earned": data.get("xp_awarded", 0),
                    "details": {"project_url": request.github_url}
                }).execute()
            except Exception as e:
                print(f"Failed to log activity: {e}")

        return data
        
    except Exception as e:
        print(f"Verification failed: {e}")
        # Default fallback
        return {
            "verified": False,
            "confidence_score": 0.0,
            "feedback": "AI verification unavailable. Please try again later.",
            "xp_awarded": 0
        }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
