export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { text, mode } = req.body;

    if (!text || !mode) {
        return res.status(400).json({ error: 'Missing text or mode' });
    }

    const apiKey = process.env.LONGCAT_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Missing LONGCAT_API_KEY environment variable. Server misconfiguration.' });
    }

    let systemInstruction = '';

    if (mode === 'grammar') {
        systemInstruction = 'You are an expert editor. Correct the grammar, spelling, and sentence structure of the provided text. Use simple, common English vocabulary suitable for an 8th or 9th-grade student. Do not change the original meaning or shorten the content. If the text is in English, make it grammatically correct but easy to read. If it is in Roman Urdu or Urdu, fix any errors while keeping it natural. Output ONLY the corrected text, nothing else.';
    } else if (mode === 'translate') {
        systemInstruction = 'You are an expert translator. Translate the provided text into clear, simple, and common English suitable for an 8th or 9th-grade student. The text may be in Urdu, Roman Urdu, or mixed languages. Preserve the original meaning and length, but keep the words easy to understand. Output ONLY the translated text, nothing else.';
    } else {
        systemInstruction = 'You are an expert translator and editor. Translate the provided text into clear, simple, and common English suitable for an 8th or 9th-grade student, and ensure perfect grammar and sentence structure. The text may be in Urdu, Roman Urdu, or basic English. Convert informal sentences into proper English without changing the meaning or shortening the content, but avoid overly complex or advanced words. Output ONLY the final English text, nothing else.';
    }

    try {
        const response = await fetch('https://api.longcat.chat/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'LongCat-Flash-Chat',
                messages: [
                    {
                        role: 'system',
                        content: systemInstruction
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                stream: false,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
