import { GoogleGenerativeAI } from "@google/generative-ai";

// Ideally this should be in an environment variable, but for this demo step we use the provided key.
const API_KEY = "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
