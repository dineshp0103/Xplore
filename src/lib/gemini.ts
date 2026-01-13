import { GoogleGenerativeAI } from "@google/generative-ai";

// Ideally this should be in an environment variable, but for this demo step we use the provided key.
<<<<<<< HEAD
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
=======
const API_KEY = "";
>>>>>>> 751df3c9ebb3fd1938879a5a3d1310fe45229397

const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
