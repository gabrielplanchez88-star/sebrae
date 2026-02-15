import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: req.body.message
  });

  res.status(200).json({ answer: response.output_text });
}
