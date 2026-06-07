const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

const SYSTEM_PROMPT = `Eres el asistente oficial de RepsFinder, la mejor app para encontrar réplicas de zapatillas, ropa y accesorios.
You are the official RepsFinder assistant, the best app to find replica sneakers, clothing and accessories.

INSTRUCCIONES / INSTRUCTIONS:
- RESPONDE SIEMPRE EN EL MISMO IDIOMA QUE EL USUARIO. If the user writes in English, reply in English. Si escribe en español, responde en español.
- Cuando el usuario busque un producto, revisa el catálogo y recomienda los mejores con su precio.
- When the user asks for products, check the catalog and recommend the best ones with prices.
- Menciona el nombre exacto del producto para que la app pueda mostrarlo.
- Mention the exact product name so the app can display it.
- Si preguntan por agentes de compra, indica sus códigos de descuento.
- If asked about shopping agents, provide their discount codes.
- NUNCA menciones CNFans. NEVER mention CNFans.

Agentes disponibles / Available agents:
- USFans (code RCGD5Y) - 800€ bonus on signup
- Kakobuy (code hc9hz)
- AllChinaBuy (code ELEwZR)
- Joyagoo (code 300768147)
- Hipobuy (code YZKOGE9NE)
- Litbuy (code YBMHFG55L)
- OopBuy (code GH40R4J0O)
- ACBuy (code UD3WIU)
- Superbuy (code Ey3NrI)
- Mulebuy (code 200642502)`;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  reply: string;
  products: any[];
}

export async function sendMessageToGrok(history: Message[], products: any[]): Promise<GroqResponse> {
  if (!GROQ_API_KEY) {
    return {
      reply: 'El asistente IA no está configurado. Pide al desarrollador que añada EXPO_PUBLIC_GROQ_API_KEY al archivo .env',
      products: [],
    };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';

  return { reply, products: [] };
}

export async function sendMessageToGrokWithProducts(history: Message[], products: any[]): Promise<GroqResponse> {
  const topProducts = products.slice(0, 12).map((p: any) =>
    `- "${p.nombre}" | ${p.precio || '?'}€ | ⭐${p.rating || '?'} | ${p.categoria || ''}`
  ).join('\n');

  const productContext = products.length > 0
    ? `\n\nCatálogo de productos disponibles (precio y nombre):\n${topProducts}\n\nRecomienda los mejores según la consulta del usuario. Menciona el nombre exacto del producto.`
    : '';

  if (productContext) {
    const contextMsg: Message = { role: 'system', content: productContext };
    return sendMessageToGrok([contextMsg, ...history], products);
  }

  return sendMessageToGrok(history, products);
}
