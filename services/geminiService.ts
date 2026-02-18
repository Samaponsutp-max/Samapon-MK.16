
import { GoogleGenAI } from "@google/genai";
import { Project, DevelopmentPlan, Asset } from "../types";

/**
 * Summarizes project status using gemini-flash-lite-latest for low latency.
 */
export async function getProjectSummaryAI(project: Project): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `สรุปสถานะโครงการโครงสร้างพื้นฐานนี้เป็นภาษาไทยสั้นๆ (ใช้โหมดความเร็วสูง)
      ชื่อโครงการ: ${project.name}
      สถานะ: ${project.status}
      ความคืบหน้า: ${project.progressPercent}%
      งบประมาณ: ${project.budgetActual.toLocaleString()} บาท
      ปัญหา: ${project.problems}`,
    });
    return response.text || "ไม่สามารถดึงข้อมูลสรุปได้";
  } catch (error) {
    console.error("Lite AI Insight Error:", error);
    return "เกิดข้อผิดพลาดในการเรียก AI";
  }
}

/**
 * Analyzes asset health using gemini-flash-lite-latest for low latency.
 */
export async function analyzeAssetHealthAI(asset: Asset): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `วิเคราะห์สภาพสินทรัพย์สั้นๆ (โหมดความเร็วสูง)
      ประเภท: ${asset.category}
      สภาพปัจจุบัน: ${asset.condition}
      ปีที่สร้าง: ${asset.constructionYear}`,
    });
    return response.text || "ไม่สามารถวิเคราะห์ได้";
  } catch (error) {
    console.error("Asset Health Lite AI Error:", error);
    return "เกิดข้อผิดพลาด AI";
  }
}

/**
 * Edits an image using gemini-2.5-flash-image (Nano Banana).
 */
export async function editImageAI(base64Image: string, prompt: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Editing Error:", error);
    return null;
  }
}

/**
 * Maps Grounding Service using gemini-2.5-flash.
 */
export async function queryMapsGroundingAI(query: string, location?: { lat: number, lng: number }): Promise<{ text: string, sources: any[] }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? { latitude: location.lat, longitude: location.lng } : undefined
          }
        }
      },
    });
    return { 
      text: response.text || "", 
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: "ไม่สามารถดึงข้อมูล Maps ได้", sources: [] };
  }
}

/**
 * Generates a high-resolution simulation image using gemini-3-pro-image-preview.
 */
export async function generateSiteSimulation(prompt: string, aspectRatio: string = "16:9"): Promise<string | null> {
  try {
    // @ts-ignore
    if (!(await window.aistudio.hasSelectedApiKey())) { await window.aistudio.openSelectKey(); }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
    }
    throw error;
  }
}

export async function analyzePlanPriorityAI(plan: DevelopmentPlan): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `วิเคราะห์ความสำคัญเร่งด่วน: ${plan.name} งบ: ${plan.estimatedBudget}`,
    });
    return response.text || "ไม่สามารถวิเคราะห์ได้";
  } catch (error) {
    console.error("Plan Analysis Error:", error);
    return "เกิดข้อผิดพลาด AI";
  }
}
