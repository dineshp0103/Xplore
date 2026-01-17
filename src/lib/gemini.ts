import { GoogleGenerativeAI } from "@google/generative-ai";

// Ideally this should be in an environment variable, but for this demo step we use the provided key.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
// Fallback models are currently unavailable (404) for this API key.
// We rely on the primary model's retry-after headers.
