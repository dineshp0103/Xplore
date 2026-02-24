from google import genai
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

print("Available models:")
for model in list(client.models.list())[:15]:
    print(f"  {model.name}")
