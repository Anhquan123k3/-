import { GoogleGenAI, Type } from "@google/genai";
import { SurveyResult } from "../types";

// Initialize Gemini Client
// Note: In a production environment, this key should be handled securely on a backend.
// We are using process.env.API_KEY as strictly instructed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

export const analyzeSurveyImage = async (base64Image: string): Promise<Partial<SurveyResult>> => {
  try {
    // Remove data URL prefix if present to get raw base64.
    // Updated regex to handle image/png, image/jpeg, image/webp etc.
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    const prompt = `
      Analyze this survey image. 
      Identify the selected option (integer value from 1 to 5) for questions 11 through 24. 
      The questions are arranged in a grid or list. 
      Look for checked boxes, circled numbers, or filled bubbles.
      Return a JSON object with keys Q11, Q12, ... Q24.
      If a value cannot be determined, set it to null.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // API is tolerant of actual format usually, but jpeg is safe default for vision
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Q11: { type: Type.INTEGER, nullable: true },
            Q12: { type: Type.INTEGER, nullable: true },
            Q13: { type: Type.INTEGER, nullable: true },
            Q14: { type: Type.INTEGER, nullable: true },
            Q15: { type: Type.INTEGER, nullable: true },
            Q16: { type: Type.INTEGER, nullable: true },
            Q17: { type: Type.INTEGER, nullable: true },
            Q18: { type: Type.INTEGER, nullable: true },
            Q19: { type: Type.INTEGER, nullable: true },
            Q20: { type: Type.INTEGER, nullable: true },
            Q21: { type: Type.INTEGER, nullable: true },
            Q22: { type: Type.INTEGER, nullable: true },
            Q23: { type: Type.INTEGER, nullable: true },
            Q24: { type: Type.INTEGER, nullable: true },
          },
          required: [
            "Q11", "Q12", "Q13", "Q14", "Q15", "Q16", "Q17", 
            "Q18", "Q19", "Q20", "Q21", "Q22", "Q23", "Q24"
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(resultText);
    return parsed as Partial<SurveyResult>;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};