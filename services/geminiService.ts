import { GoogleGenAI, Type } from "@google/genai";
import { LearningCard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We define a strict schema to ensure Gemini returns exactly what our UI needs
const cardSchema = {
  type: Type.OBJECT,
  properties: {
    word: {
      type: Type.STRING,
      description: "The target English word (noun, verb, or adjective) for the user to learn. Common daily words.",
    },
    phonetic: {
      type: Type.STRING,
      description: "Simple phonetic pronunciation string.",
    },
    definition: {
      type: Type.STRING,
      description: "A simple, clear definition in English using basic vocabulary.",
    },
    options: {
      type: Type.ARRAY,
      description: "3 distinct situations or phrases. Only ONE matches the target word concept.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { 
            type: Type.STRING, 
            description: "A scenario, phrase, or related concept description. e.g., for 'Car', 'I need to drive to the supermarket'." 
          },
          isCorrect: { type: Type.BOOLEAN },
          explanation: {
            type: Type.STRING,
            description: "Brief explanation in English why this is right or wrong."
          }
        },
        required: ["id", "text", "isCorrect", "explanation"],
        propertyOrdering: ["id", "text", "isCorrect", "explanation"]
      },
    },
  },
  required: ["word", "definition", "options"],
  propertyOrdering: ["word", "phonetic", "definition", "options"]
};

// Helper to generate an image for the word
async function generateWordImage(word: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            text: `Create a simple, cheerful, flat vector-style illustration of the word "${word}". White background, minimalist design, high contrast.` 
          }
        ],
      },
    });

    // Extract image data from the response parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.warn("Failed to generate image:", error);
    return undefined; // Fail gracefully without image
  }
  return undefined;
}

export const generateNextCard = async (excludeWords: string[] = []): Promise<LearningCard> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Generate a learning card for an English student.
    Objective: Learn English by association (Immersion), NOT translation.
    
    1. Select a common, useful English word (CEFR level A2 or B1).
    2. Do NOT use these words: ${excludeWords.join(", ")}.
    3. The 'options' should be scenarios or situational sentences that help the user associate the concept. 
       - If the word is 'Umbrella', the correct option could be 'It is raining outside and I don't want to get wet.'
       - The distractors should be scenarios for completely different concepts (e.g., 'I am hungry', 'I am tired').
    4. Keep the English simple and clear.
  `;

  try {
    // 1. Generate text content (JSON)
    const textResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cardSchema,
        temperature: 0.7,
      }
    });

    const text = textResponse.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const cardData = JSON.parse(text) as LearningCard;

    // 2. Generate image content (Visual Association)
    // We do this after getting the word to ensure the image matches the word.
    const imageUrl = await generateWordImage(cardData.word);

    return {
      ...cardData,
      imageUrl
    };

  } catch (error) {
    console.error("Gemini generation error:", error);
    // Fallback static data in case of API failure to prevent app crash
    return {
      word: "Apple",
      phonetic: "/ˈæp.əl/",
      definition: "A round fruit with red or green skin and a white inside.",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
      options: [
        { id: "1", text: "You wear this on your feet.", isCorrect: false, explanation: "This describes shoes." },
        { id: "2", text: "A healthy snack that keeps the doctor away.", isCorrect: true, explanation: "Correct! Apples are a healthy fruit." },
        { id: "3", text: "You use this to type on a computer.", isCorrect: false, explanation: "This describes a keyboard." }
      ]
    };
  }
};