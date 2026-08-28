// Integração com a API do Grok (xAI)
// Docs: https://docs.x.ai/api

async function analyzeWithGrok(apiKey, model, prompt, content, imageBase64 = null) {
  const messages = [];

  if (imageBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
        },
        { type: 'text', text: prompt + '\n\nAnalisa este conteúdo e responde apenas com JSON: {"harmful": true/false, "reason": "motivo"}' },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: prompt + `\n\nMensagem a analisar: "${content}"\n\nResponde apenas com JSON: {"harmful": true/false, "reason": "motivo"}`,
    });
  }

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'grok-beta',
      messages,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { harmful: false, reason: 'Não foi possível analisar' };
  }
}

module.exports = { analyzeWithGrok };
