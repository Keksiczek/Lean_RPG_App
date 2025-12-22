
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
          title: { type: Type.STRING, description: "Action-oriented title of the countermeasure" },
          description: { type: Type.STRING, description: "Detailed explanation of how this solves the root cause" },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING, description: "Numbered step for implementation" }
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
    overallCompliance: { type: Type.INTEGER, description: "Workplace compliance score from 0-100" },
    observation: { type: Type.STRING, description: "General summary of the area condition" },
    detectedHazards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the violating object or condition" },
          action: { type: Type.STRING, enum: ["Sort", "Set in Order", "Shine", "Standardize", "Sustain"], description: "Specific 5S pillar to apply" },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          suggestion: { type: Type.STRING, description: "Corrective action recommendation" },
          location: {
            type: Type.OBJECT,
            properties: {
              top: { type: Type.INTEGER, description: "Vertical percentage (0-100) from top of image" },
              left: { type: Type.INTEGER, description: "Horizontal percentage (0-100) from left of image" }
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
    verified: { type: Type.BOOLEAN, description: "True if the standard is met, false otherwise" },
    confidence: { type: Type.INTEGER, description: "AI confidence level 0-100" },
    observations: { 
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "Specific visual evidence found" }
    },
    safetyRisk: { type: Type.BOOLEAN, description: "Whether a safety violation was detected" },
    identifiedIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "List of process deviations" }
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
  const causesText = causes.map(c => `- [${c.category}] ${c.cause} (Root Cause: ${c.isRootCause})`).join("\n");

  const prompt = `
    Role: Senior Continuous Improvement Consultant.
    Task: Generate actionable countermeasures using PDCA logic.
    Problem: ${problemTitle}
    Context: ${problemDescription}
    
    Identified Causes:
    ${causesText}
    
    Output 3 high-impact solutions in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: solutionSchema,
        temperature: 0.2, 
      },
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text);
    return result.solutions || [];
  } catch (error) {
    console.error("Ishikawa Solution Error:", error);
    throw new Error("AI failed to generate solutions.");
  }
};

export const analyze5SImage = async (base64Image: string, context?: string, checklist: string[] = []): Promise<LensScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptText = `Role: Lean 5S Auditor. 
  Perform a strict audit of the workstation: "${context || "Production Area"}". 
  
  Focus on:
  - Safety hazards (trips, spills)
  - Clutter (items not needed for current work)
  - Organization (shadow boards, labels)
  - Cleanliness (dust, oil, waste)
  
  Instructions for JSON Output:
  1. Calculate compliance score based on 5S standards.
  2. For EACH violation, estimate visual coordinates (top/left) as percentages.
  3. Reference this checklist: ${checklist.join(', ')}.
  
  Be precise and critical. If it's not standard, it's a violation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: promptText }]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: lensSchema,
        temperature: 0.1
      }
    });

    const text = response.text;
    if (!text) throw new Error("Vision AI returned empty response");
    const result = JSON.parse(text);
    
    const primary = result.detectedHazards?.[0];
    return { 
      ...result, 
      itemDetected: primary?.name, 
      suggested5SAction: primary?.action, 
      practicalAction: primary?.suggestion,
      checklistResults: result.checklistResults || []
    };
  } catch (error) {
    console.error("5S Scan Error:", error);
    return { overallCompliance: 0, observation: "Scan failure", detectedHazards: [], checklistResults: [], itemDetected: "N/A", suggested5SAction: "N/A", practicalAction: "N/A" };
  }
};

export const analyzeLPAImage = async (base64Image: string, question: string, expectedAnswer: string): Promise<LPAScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Task: Layered Process Audit (LPA) Verification.
  Standard being verified: "${question}"
  Target State (OK): "${expectedAnswer}"
  
  Evaluate the provided image. Does the reality match the standard? 
  Report evidence and confidence score.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: prompt }]
      },
      config: { responseMimeType: "application/json", responseSchema: lpaSchema }
    });
    const text = response.text;
    const result = text ? JSON.parse(text) : null;
    
    if (!result) throw new Error("LPA Verification Error");

    return {
        ...result,
        compliance: result.verified ? (result.confidence > 85 ? 'High' : 'Medium') : 'Low',
        safetyRisk: result.safetyRisk ?? false,
        identifiedIssues: result.identifiedIssues ?? []
    };
  } catch (error) {
    console.error("LPA Analysis Error:", error);
    return { verified: false, confidence: 0, compliance: "Low", observations: ["System failed to analyze process"], safetyRisk: true, identifiedIssues: ["Network/AI error"] };
  }
};

let chatSession: Chat | null = null;
export const sendMessageToSensei = async (message: string, context?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are 'Lean Sensei', an elite Toyota Production System mentor. 
        Style: Encouraging, Socratic, highly practical. 
        Focus: 5S, Kaizen, 8 Wastes (Muda, Mura, Muri), Root Cause Analysis. 
        Tone: Wise, concise, avoiding corporate fluff. Always relate answers to the factory floor (Gemba).`
      }
    });
  }
  try {
    const content = context ? `[gemba_location: ${context}] ${message}` : message;
    const result = await chatSession.sendMessage({ message: content });
    return result.text || "I am reflecting on your question...";
  } catch (error) {
    chatSession = null;
    return "The connection to the Sensei's chamber was lost. Please try again.";
  }
};
