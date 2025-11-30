
import { GoogleGenAI, Type } from "@google/genai";
import { Manga, RecommendedManga } from "../types";
import { searchManga } from "./anilist";
import { GEMINI_API_KEY } from "../constants";

export const getRecommendations = async (library: Manga[], sourceManga?: Manga): Promise<RecommendedManga[]> => {
  // Safety check: if no key, return empty immediately instead of crashing
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key is missing. Recommendations disabled.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  let prompt = "";

  // 1. Single Title Mode
  if (sourceManga) {
    const title = sourceManga.title.english || sourceManga.title.userPreferred || sourceManga.title.romaji;
    prompt = `
      I really enjoyed the manhwa/manga called "${title}".
      Please recommend 10 similar manhwa (specifically Korean webtoons if possible) that are very similar to this specific title.
      Provide the exact English title and a short 1-sentence reason why.
    `;
  } 
  // 2. Library Mode
  else {
    if (library.length === 0) {
      return [];
    }
    const titles = library.slice(0, 15).map(m => m.title.english || m.title.userPreferred || m.title.romaji).join(", ");
    prompt = `
      I have read the following manhwa/manga: ${titles}.
      Please recommend 10 similar manhwa (specifically Korean webtoons if possible) that I might like based on my taste.
      Provide the exact English title and a short 1-sentence reason why.
    `;
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    }
                }
            }
        }
    });

    // Clean the response text to remove potential Markdown code blocks
    let jsonText = response.text || "[]";
    jsonText = jsonText.replace(/^```json/g, "").replace(/^```/g, "").replace(/```$/g, "").trim();

    let recommendations = [];
    try {
      recommendations = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", jsonText);
      return [];
    }
    
    const results: RecommendedManga[] = [];

    // Fetch details for each recommended title
    await Promise.all(recommendations.map(async (rec: { title: string; reason: string }) => {
        try {
            const searchResults = await searchManga(rec.title);
            if (searchResults && searchResults.length > 0) {
                // Check if we haven't already added this ID (dedupe)
                if (!results.some(r => r.id === searchResults[0].id)) {
                    results.push({
                        ...searchResults[0],
                        recommendationReason: rec.reason
                    });
                }
            }
        } catch (err) {
            console.error(`Failed to fetch metadata for ${rec.title}`, err);
        }
    }));

    return results;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
