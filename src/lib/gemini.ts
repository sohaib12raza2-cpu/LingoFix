import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!apiKey) {
  console.error('Missing VITE_GEMINI_API_KEY environment variable. Please add it to your Vercel project settings.');
}

const ai = new GoogleGenAI({ apiKey });

export type ProcessMode = 'grammar' | 'translate' | 'both';

export async function processText(text: string, mode: ProcessMode) {
  let systemInstruction = '';
  
  if (mode === 'grammar') {
    systemInstruction = 'You are an expert editor. Correct the grammar, spelling, and sentence structure of the provided text. Use simple, common English vocabulary suitable for an 8th or 9th-grade student. Do not change the original meaning or shorten the content. If the text is in English, make it grammatically correct but easy to read. If it is in Roman Urdu or Urdu, fix any errors while keeping it natural. Output ONLY the corrected text, nothing else.';
  } else if (mode === 'translate') {
    systemInstruction = 'You are an expert translator. Translate the provided text into clear, simple, and common English suitable for an 8th or 9th-grade student. The text may be in Urdu, Roman Urdu, or mixed languages. Preserve the original meaning and length, but keep the words easy to understand. Output ONLY the translated text, nothing else.';
  } else {
    systemInstruction = 'You are an expert translator and editor. Translate the provided text into clear, simple, and common English suitable for an 8th or 9th-grade student, and ensure perfect grammar and sentence structure. The text may be in Urdu, Roman Urdu, or basic English. Convert informal sentences into proper English without changing the meaning or shortening the content, but avoid overly complex or advanced words. Output ONLY the final English text, nothing else.';
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: text,
    config: {
      systemInstruction,
      temperature: 0.3,
    }
  });

  return response.text;
}
