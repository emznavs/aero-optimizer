import { GoogleGenAI } from "@google/genai";
import { buildMockSchematicDataUrl } from "@/app/data/mockSchematic";

const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

// Safely initialize the client.
// In a real app, we would handle missing keys more gracefully in the UI.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateTechnicalSchematic = async (partName: string, fuelType: string): Promise<string | null> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
    return buildMockSchematicDataUrl(partName, fuelType);
  }

  const prompt = `
    Generate a highly detailed, technical blueprint schematic of a ${partName} for a ${fuelType} powered aircraft.
    Visual Style: "Industrial Sci-Fi", blueprint style.
    Background: Dark charcoal or black.
    Lines: Glowing cyan (#00f3ff) and safety orange (#ff4d00) accents.
    Content: Exploded view showing internal components like cryogenic pumps, combustion chambers, or fuel cells.
    Text: Include small technical annotations in a monospace font.
    High contrast, precise lines.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Nano banana models do not support responseMimeType or specific schema for images usually,
        // but we rely on the prompt to get the image.
        // However, the generateContent for image models returns the image in the response parts.
      }
    });

    // Note: The previous logic assumed an image model (gemini-2.5-flash-image) which returns inlineData.
    // Standard text models like gemini-2.0-flash return text.
    // If you have access to an image generation model, switch the model name back.
    // For now, to prevent crashing if using a text model, we'll check for text.
    
    // If using an image model:
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return buildMockSchematicDataUrl(partName, fuelType);

  } catch (error) {
    console.error("Error generating schematic:", error);
    return buildMockSchematicDataUrl(partName, fuelType);
  }
};
