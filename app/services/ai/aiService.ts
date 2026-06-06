interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GrokResponse {
  reply: string;
  products: any[];
}

export async function sendMessageToGrok(history: Message[], products: any[]): Promise<GrokResponse> {
  const topProducts = products.slice(0, 5).map((p: any) => `- ${p.nombre || 'Unknown'} (${p.precio || '?'}€)`).join('\n');

  const productContext = products.length > 0
    ? `\n\nProductos disponibles:\n${topProducts}`
    : '';

  const lastMessage = history[history.length - 1]?.content || '';

  const reply = `He encontrado información sobre "${lastMessage}".${productContext}\n\n¿Te gustaría ver más detalles de algún producto en específico?`;

  return {
    reply,
    products: products.slice(0, 3),
  };
}
