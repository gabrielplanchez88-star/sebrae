import fs from "fs";
import path from "path";
import OpenAI from "openai";

const REQUIRED = [
  "FAQ - Atendimento.docx",
  "Boas prátivas de configuração de Soluções na Plataforma Moodle_UCSebrae.docx"
];

const docsDir = path.join(process.cwd(), "docs");

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("ERRO: Defina OPENAI_API_KEY no ambiente (local).");
    process.exit(1);
  }

  if (!fs.existsSync(docsDir)) {
    console.error("ERRO: pasta /docs não existe.");
    process.exit(1);
  }

  const files = fs.readdirSync(docsDir).filter(f => !f.startsWith("."));
  const missing = REQUIRED.filter(f => !files.includes(f));
  if (missing.length) {
    console.error("ERRO: faltam arquivos obrigatórios em /docs:");
    console.error(missing.map(x => `- ${x}`).join("\n"));
    process.exit(1);
  }

  const extras = files.filter(f => !REQUIRED.includes(f));
  if (extras.length) {
    console.error("ERRO: existem arquivos extras em /docs. Remova para manter a base só com 2 docs:");
    console.error(extras.map(x => `- ${x}`).join("\n"));
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });

  console.log("1) Criando Vector Store...");
  const vs = await client.vectorStores.create({ name: "Sistema de Conhecimento Projeto Sebrae" });
  console.log("✅ Vector Store ID:", vs.id);

  console.log("2) Enviando os 2 documentos...");
  const fileIds = [];
  for (const filename of REQUIRED) {
    const full = path.join(docsDir, filename);
    const uploaded = await client.files.create({
      file: fs.createReadStream(full),
      purpose: "assistants"
    });
    fileIds.push(uploaded.id);
    console.log("⬆️  Enviado:", filename, "->", uploaded.id);
  }

  console.log("3) Indexando no Vector Store...");
  await client.vectorStores.fileBatches.create(vs.id, { file_ids: fileIds });

  console.log("\n✅ Pronto!");
  console.log("Configure no Netlify (Environment variables):");
  console.log("OPENAI_VECTOR_STORE_ID=" + vs.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
