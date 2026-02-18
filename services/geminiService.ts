
import { GoogleGenAI, Type } from "@google/genai";
import { Project, DevelopmentPlan, Asset, AIProjectAnalysis } from "../types";

/**
 * Summarizes project status using gemini-3-flash-preview.
 */
export async function getProjectSummaryAI(project: Project): Promise<AIProjectAnalysis> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `วิเคราะห์และสรุปสถานะโครงการโครงสร้างพื้นฐานนี้อย่างละเอียดในรูปแบบ JSON ภาษาไทย
      ชื่อโครงการ: ${project.name}
      สถานะ: ${project.status}
      ความคืบหน้า: ${project.progressPercent}%
      งบประมาณ: ${project.budgetActual.toLocaleString()} บาท
      ผู้รับเหมา: ${project.contractor}
      วิศวกร: ${project.engineer}
      ปัญหา: ${project.problems}
      
      ให้ประเมินความเสี่ยง (risks) และรายการที่ควรดำเนินการ (actionItems) ตามความเหมาะสม`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "สรุปภาพรวมของโครงการ" },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "ระดับความรุนแรง: LOW, MEDIUM, HIGH" },
                  description: { type: Type.STRING }
                },
                required: ["title", "severity", "description"]
              }
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "รายการสิ่งที่ต้องดำเนินการถัดไป"
            },
            healthScore: { type: Type.NUMBER, description: "คะแนนสุขภาพโครงการ 0-100" }
          },
          required: ["summary", "risks", "actionItems", "healthScore"]
        }
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text) as AIProjectAnalysis;
  } catch (error) {
    console.error("Structured AI Insight Error:", error);
    return {
      summary: "ไม่สามารถประมวลผลข้อมูลได้ในขณะนี้",
      risks: [],
      actionItems: ["ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต", "ลองใหม่อีกครั้งในภายหลัง"],
      healthScore: 0
    };
  }
}

/**
 * Deep Strategic Insight using gemini-3-pro-preview with thinking mode for complex reasoning.
 */
export async function getDeepStrategicInsightAI(project: Project): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `ในฐานะผู้เชี่ยวชาญด้านการวางแผนยุทธศาสตร์เมืองและโครงสร้างพื้นฐานระดับสูง โปรดวิเคราะห์โครงการนี้เชิงลึก:
      ชื่อโครงการ: ${project.name}
      งบประมาณ: ${project.budgetActual.toLocaleString()} บาท
      ความคืบหน้า: ${project.progressPercent}%
      ปัญหาที่พบ: ${project.problems}
      
      โปรดวิเคราะห์ผลกระทบเชิงเศรษฐศาสตร์มหภาค, ความยั่งยืนในระยะ 20 ปี, และการบูรณาการเข้ากับระบบ Smart City ของไทยในอนาคต โดยใช้ตรรกะเหตุผลที่ซับซ้อนที่สุดเท่าที่เป็นไปได้`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "ไม่มีผลลัพธ์จากการวิเคราะห์เชิงลึก";
  } catch (error) {
    console.error("Deep Insight Error:", error);
    return "เกิดข้อผิดพลาดในการวิเคราะห์เชิงลึก";
  }
}

/**
 * Analyzes asset health using gemini-flash-lite-latest.
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
    // Strip metadata from base64 if present
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
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
