import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = image.split(",")[1] || image;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      `Analyze this image for urban infrastructure issues.
      1. Identify if there is a defect (pothole, crack, damaged sign, trash, streetlight outage, etc.).
      2. If yes, strictly classify the Defect Type (e.g., "Pothole", "Cracks", "Debris", "Drainage", "Signage").
      3. Estimate Severity (Low, Medium, High).
      4. Write a concise technical description (1-2 sentences).

      Return ONLY a JSON object with this structure:
      {
        "isDefect": boolean,
        "defectType": string,
        "severity": string,
        "description": string,
        "title": string (a short, factual title like "Severe Pothole on [Road Surface]")
      }`,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
    ]);

    const text = (await result.response).text().replace(/```json|```/g, "").trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
