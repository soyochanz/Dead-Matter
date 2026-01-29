const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";

/**
 * Translates text using Google Gemini AI.
 * @param {string} text - The content to translate.
 * @param {string} targetLanguage - The language to translate to (e.g., 'English', 'Portuguese').
 * @returns {Promise<string>} - The translated text.
 */
export const translateContent = async (text, targetLanguage) => {
    if (!GEMINI_API_KEY) {
        console.warn("Gemini API Key missing. Skipping translation.");
        return text;
    }

    if (!text || text.trim() === "") return "";

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Translate the following text to ${targetLanguage}. Keep the same formatting, HTML tags, and tone. Only return the translated text, nothing else:\n\n${text}`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "Gemini API Error");
        }

        const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!translatedText) return text;

        // Clean up markdown code blocks if the AI accidentally wrapped the response
        let cleaned = translatedText.trim();
        if (cleaned.startsWith('```')) {
            // Remove first line (e.g., ```html) and last line (```)
            const lines = cleaned.split('\n');
            if (lines.length > 2) {
                cleaned = lines.slice(1, -1).join('\n').trim();
            } else {
                cleaned = cleaned.replace(/```[a-z]*|```/gi, '').trim();
            }
        }

        return cleaned || text;

    } catch (error) {
        console.error("Translation error:", error);
        throw error;
    }
};
