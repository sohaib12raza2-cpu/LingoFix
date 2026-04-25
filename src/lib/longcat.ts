export type ProcessMode = 'grammar' | 'translate' | 'both';

export async function processText(text: string, mode: ProcessMode) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      mode
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
