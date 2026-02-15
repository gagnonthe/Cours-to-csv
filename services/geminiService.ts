
import { GoogleGenAI, Type } from "@google/genai";
import { QAPair } from "../types";

export const generateQuizFromContent = async (content: string): Promise<QAPair[]> => {
  if (!process.env.API_KEY) {
    throw new Error("Clé API manquante.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyse le cours suivant et génère une liste de questions-réponses pertinentes pour réviser. 
    Chaque paire doit être concise mais complète.
    
    COURS :
    ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "La question basée sur le contenu du cours.",
            },
            answer: {
              type: Type.STRING,
              description: "La réponse précise à la question.",
            },
          },
          required: ["question", "answer"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Aucune réponse reçue de l'IA.");
  }

  try {
    return JSON.parse(text.trim());
  } catch (err) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("Le format de réponse de l'IA est invalide.");
  }
};
