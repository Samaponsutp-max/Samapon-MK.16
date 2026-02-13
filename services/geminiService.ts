
import { GoogleGenAI } from "@google/genai";
import { Project, DevelopmentPlan, Asset } from "../types";

// For basic text tasks
const aiText = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProjectSummaryAI(project: Project): Promise<string> {
  try {
    const response = await aiText.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `สรุปสถานะโครงการโครงสร้างพื้นฐานนี้เป็นภาษาไทยสั้นๆ 
      ชื่อโครงการ: ${project.name}
      สถานะ: ${project.status}
      ความคืบหน้า: ${project.progressPercent}%
      งบประมาณ: ${project.budgetActual.toLocaleString()} บาท
      ปัญหา: ${project.problems}
      
      ให้คำแนะนำสั้นๆ 1-2 ประโยคในการจัดการปัญหาหรือก้าวต่อไป`,
    });
    return response.text || "ไม่สามารถดึงข้อมูลสรุปได้";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "เกิดข้อผิดพลาดในการเรียก AI";
  }
}

/**
 * Maps Grounding Service using gemini-2.5-flash.
 * Used for querying real-world locations and nearby infrastructure.
 */
export async function queryMapsGroundingAI(query: string, location?: { lat: number, lng: number }): Promise<{ text: string, sources: any[] }> {
  try {
    const aiMaps = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await aiMaps.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? {
              latitude: location.lat,
              longitude: location.lng
            } : undefined
          }
        }
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: "ไม่สามารถดึงข้อมูลจาก Google Maps ได้ในขณะนี้", sources: [] };
  }
}

export async function analyzePlanPriorityAI(plan: DevelopmentPlan): Promise<string> {
  try {
    const response = await aiText.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `วิเคราะห์ความเหมาะสมของโครงการในแผนพัฒนาท้องถิ่น
      ชื่อโครงการ: ${plan.name}
      ประเภท: ${plan.category}
      ลำดับความสำคัญ: ${plan.priority}
      งบประมาณที่คาดการณ์: ${plan.estimatedBudget.toLocaleString()} บาท
      สถานะ: ${plan.status}
      
      ช่วยให้ความเห็นในฐานะผู้เชี่ยวชาญด้านการวางแผนกลยุทธ์ท้องถิ่นว่าโครงการนี้ควรได้รับการจัดสรรงบประมาณในปีถัดไปหรือไม่ และมีประเด็นใดที่ควรพิจารณาเพิ่มเติม (ตอบสั้นๆ 2-3 ประโยค)`,
    });
    return response.text || "ไม่สามารถวิเคราะห์แผนได้";
  } catch (error) {
    return "ไม่สามารถเชื่อมต่อ AI เพื่อวิเคราะห์แผนได้";
  }
}

/**
 * Generates a high-resolution satellite map image using gemini-3-pro-image-preview.
 */
export async function generateSatelliteImage(prompt: string): Promise<string | null> {
  try {
    // @ts-ignore
    if (!(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }

    const aiImage = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await aiImage.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "4K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
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

/**
 * Analyzes an Asset to provide a maintenance strategy.
 */
export async function analyzeAssetHealthAI(asset: Asset): Promise<string> {
  try {
    const response = await aiText.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `วิเคราะห์สภาพสินทรัพย์โครงสร้างพื้นฐานและแนะนำแผนซ่อมบำรุง
      ประเภท: ${asset.category}
      ปีที่สร้าง: ${asset.constructionYear}
      อายุการใช้งานที่คาดหวัง: ${asset.expectedLifeYears} ปี
      สภาพปัจจุบัน: ${asset.condition}
      งบซ่อมบำรุงล่าสุด: ${asset.maintenanceBudget.toLocaleString()} บาท
      ประวัติการซ่อม: ${asset.history.join(", ")}
      
      กรุณาตอบเป็นภาษาไทยสั้นๆ 2-3 ประโยค แนะนำว่าควรทำอย่างไรในลำดับถัดไปเพื่อยืดอายุการใช้งาน`,
    });
    return response.text || "ไม่สามารถวิเคราะห์ข้อมูลสินทรัพย์ได้";
  } catch (error) {
    return "เกิดข้อผิดพลาดในการประมวลผลข้อมูล AI สำหรับสินทรัพย์";
  }
}
