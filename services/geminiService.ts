
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { IshikawaCause, IshikawaSolution, LensScanResult, LPAScanResult } from "../types";

const solutionSchema = {
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

const lensSchema = {
  type: Type.OBJECT,
  properties: {
    overallCompliance: { type: Type.INTEGER, description: "0 to 100" },
    observation: { type: Type.STRING },
    detectedHazards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          action: { type: Type.STRING, enum: ["Sort", "Set in Order", "Shine", "Standardize", "Sustain"] },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          suggestion: { type: Type.STRING },
          location: {
            type: Type.OBJECT,
            properties: {
              top: { type: Type.INTEGER, description: "Percentage from top 0-100" },
              left: { type: Type.INTEGER, description: "Percentage from left 0-100" }
            },
            required: ["top", "left"]
          }
        },
        required: ["name", "action", "severity", "suggestion", "location"]
      }
    }
  },
  required: ["overallCompliance", "observation", "detectedHazards"]
};

const lpaSchema = {
  type: Type.OBJECT,
  properties: {
    verified: { type: Type.BOOLEAN, description: "Whether the image matches the expected standard" },
    confidence: { type: Type.INTEGER, description: "0 to 100" },
    observations: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    safetyRisk: { type: Type.BOOLEAN },
    identifiedIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["verified", "confidence", "observations", "safetyRisk", "identifiedIssues"]
};

export const generateSolutions = async (
  problemTitle: string,
  problemDescription: string,
  causes: IshikawaCause[]
): Promise<IshikawaSolution[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: Property 'text' does not exist on type 'IshikawaCause'. Using 'cause' property as defined in types.ts.
  const causesText = causes.map(c => `- [${c.category}] ${c.cause}`).join("\n");

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
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        // Correct usage of generateContent config for JSON response.
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

export const analyze5SImage = async (base64Image: string, context?: string, checklist: string[] = []): Promise<LensScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let promptText = `Role: Real-time Lean 5S Auditor. Analyze the image for 5S violations in: "${context || "General Workplace"}". 
  
  Focus: Clutter, missing labels, misplaced tools, safety hazards.
  
  For EVERY violation:
  1. Identify the object/area precisely.
  2. Map to Sort, Set in Order, Shine, Standardize, or Sustain.
  3. Provide a practical suggestion.
  4. COORDINATES: Estimate (top, left) percentages (0-100) where the violation is visible.
  
  Checklist context: ${checklist.join(', ')}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        // Multi-part input with image and text.
        parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: promptText }]
      },
      config: { responseMimeType: "application/json", responseSchema: lensSchema }
    });

    const text = response.text;
    if (!text) throw new Error("No vision response");
    const result = JSON.parse(text);
    
    const primaryHazard = result.detectedHazards?.[0];
    return { 
      ...result, 
      itemDetected: primaryHazard?.name, 
      suggested5SAction: primaryHazard?.action, 
      practicalAction: primaryHazard?.suggestion,
      checklistResults: []
    };
  } catch (error) {
    console.error("Vision Error:", error);
    return { overallCompliance: 0, observation: "Error", detectedHazards: [], checklistResults: [], itemDetected: "Error", suggested5SAction: "N/A", practicalAction: "N/A" };
  }
};

export const analyzeLPAImage = async (base64Image: string, question: string, expectedAnswer: string): Promise<LPAScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Task: Verify industrial process compliance.
  Question being checked: "${question}"
  Expected Answer (Standard): "${expectedAnswer}"
  
  Analyze the image. Does the visual evidence match the expected standard? 
  Report "verified: true" if it complies, "false" if it doesn't. 
  List specific observations.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        // Multi-part input with image and text.
        parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: prompt }]
      },
      config: { responseMimeType: "application/json", responseSchema: lpaSchema }
    });
    const text = response.text;
    const result = text ? JSON.parse(text) : { verified: false, confidence: 0, observations: [], safetyRisk: true, identifiedIssues: [] };
    
    return {
        ...result,
        compliance: result.verified ? (result.confidence > 80 ? 'High' : 'Medium') : 'Low',
        safetyRisk: result.safetyRisk ?? true,
        identifiedIssues: result.identifiedIssues ?? []
    };
  } catch (error) {
    console.error("LPA Vision Error:", error);
    // Fix: Added missing verified and confidence properties to match LPAScanResult interface.
    return { verified: false, confidence: 0, compliance: "Low", observations: ["Error analyzing image"], safetyRisk: true, identifiedIssues: [] as string[] };
  }
};

let chatSession: Chat | null = null;
export const sendMessageToSensei = async (message: string, context?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  if (!chatSession) {
    // Create a new chat session with system instruction.
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are 'Lean Sensei', a wise and encouraging mentor in a manufacturing environment. Guide users through Lean principles using Socratic questioning. Keep responses concise and practical."
      }
    });
  }
  try {
    const content = context ? `[CONTEXT: ${context}] ${message}` : message;
    const result = await chatSession.sendMessage({ message: content });
    return result.text || "I'm thinking...";
  } catch (error) {
    chatSession = null; // Reset on error
    return "Connection interrupted. Let's try that again.";
  }
};
