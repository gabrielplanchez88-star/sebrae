import OpenAI from "openai";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const { message, history } = JSON.parse(event.body || "{}");

    if (!message || typeof message !== "string") {
      return { statusCode: 400, body: JSON.stringify({ error: "Mensagem inválida." }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "OPENAI_API_KEY não configurado no Netlify." }) };
    }
    if (!vectorStoreId) {
      return { statusCode: 500, body: JSON.stringify({ error: "OPENAI_VECTOR_STORE_ID não configurado no Netlify." }) };
    }

    const client = new OpenAI({ apiKey });

    const system = `
Você é o "Sistema de Conhecimento Projeto Sebrae".
Regras obrigatórias:
1) Use SOMENTE o conteúdo encontrado nos documentos indexados (FAQ Atendimento e Boas Práticas Moodle).
2) Se a resposta não estiver claramente suportada pelos documentos, responda exatamente:
"Não encontrei essa informação nos materiais disponíveis."
3) Não invente. Não use conhecimento externo. Não faça suposições.
4) Responda em PT-BR, de forma objetiva, com passos quando aplicável.
`.trim();

    const input = [{ role: "system", content: system }];

    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item?.role && typeof item?.content === "string") input.push(item);
      }
    }

    input.push({ role: "user", content: message });

    const resp = await client.responses.create({
      model: "gpt-5",
      input,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: { vector_store_ids: [vectorStoreId] }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resp.output_text || "" })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Falha na função." }) };
  }
};
