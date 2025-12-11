import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { IshikawaCause, IshikawaSolution, LensScanResult } from "../types";

// Schema for structured output
const solutionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    solutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "priority", "steps"]
      }
    }
  },
  required: ["solutions"]
};

const lensSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    itemDetected: { type: Type.STRING },
    observation: { type: Type.STRING },
    suggested5SAction: { type: Type.STRING, enum: ["Sort", "Set in Order", "Shine", "Standardize", "Sustain"] },
    practicalAction: { type: Type.STRING }
  },
  required: ["itemDetected", "observation", "suggested5SAction", "practicalAction"]
};

// --- Ishikawa Generation ---
export const generateSolutions = async (
  problemTitle: string,
  problemDescription: string,
  causes: IshikawaCause[]
): Promise<IshikawaSolution[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return [
      {
        title: "Standardize Operator Training",
        description: "Develop a TWI (Training Within Industry) module.",
        priority: "High",
        steps: ["Create standard work sheet", "Train shift supervisors"]
      },
      {
        title: "Preventative Maintenance Schedule",
        description: "Update the PM schedule.",
        priority: "Medium",
        steps: ["Audit current PM logs", "Adjust frequency"]
      }
    ];
  }

  const ai = new GoogleGenAI({ apiKey });

  const causesText = causes.map(c => `- [${c.category}] ${c.text}`).join("\n");

  const prompt = `
    You are a Lean Manufacturing Expert.
    Problem: ${problemTitle}
    Context: ${problemDescription}
    Identified Root Causes:
    ${causesText}
    Generate 3 specific countermeasures.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: solutionSchema,
        temperature: 0.3, 
      },
    });

    const text = response.text;
    if (!text) return [];

    const result = JSON.parse(text);
    return result.solutions || [];

  } catch (error) {
    console.error("Error generating solutions:", error);
    throw new Error("Failed to generate solutions.");
  }
};

// --- Vision / Lens Analysis ---
export const analyze5SImage = async (base64Image: string): Promise<LensScanResult> => {
  const apiKey = process.env.API_KEY;
  
  // Mock fallback if no API key
  if (!apiKey) {
    return new Promise(resolve => setTimeout(() => resolve({
      itemDetected: "Cluttered Workspace (Simulation)",
      observation: "There are multiple objects that appear unnecessary for the immediate task.",
      suggested5SAction: "Sort",
      practicalAction: "Remove items not needed for current production."
    }), 2000));
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Analyze this image for 5S compliance (Lean Manufacturing). Identify ONE specific item or area that violates 5S principles (clutter, dirt, unorganized tools, safety hazard). Provide a structured assessment."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: lensSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from vision model");
    
    return JSON.parse(text) as LensScanResult;
  } catch (error) {
    console.error("Vision Error:", error);
    // Graceful fallback
    return {
      itemDetected: "Unknown Object",
      observation: "Could not clearly identify 5S issues.",
      suggested5SAction: "Sustain",
      practicalAction: "Ensure the area is maintained."
    };
  }
};

// --- Lean Sensei Chat ---
let chatSession: Chat | null = null;

export const sendMessageToSensei = async (message: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return "I am running in demo mode. Please configure the API Key to chat with me about Lean methodologies!";
  }

  const ai = new GoogleGenAI({ apiKey });

  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are 'Lean Sensei', a wise and encouraging mentor. Teach Lean (5S, Kaizen). Keep answers short.`
      }
    });
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "I'm thinking...";
  } catch (error) {
    console.error("Chat error:", error);
    return "I seem to be having trouble connecting to the factory network.";
  }
};