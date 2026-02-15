# Sistema de Conhecimento Projeto Sebrae (Netlify)

Este projeto publica uma interface web + uma Netlify Function para responder perguntas usando SOMENTE os dois documentos DOCX do diretório /docs (indexados em um Vector Store da OpenAI).

## 1) Criar o Vector Store (no seu computador)
1. Coloque os 2 arquivos DOCX em `/docs` (já vêm no ZIP).
2. Instale dependências:
   npm install
3. Defina a variável local (exemplos):
   - macOS/Linux:
     export OPENAI_API_KEY="SUA_CHAVE"
   - Windows (PowerShell):
     $env:OPENAI_API_KEY="SUA_CHAVE"
4. Rode:
   npm run upload
5. Copie o ID exibido (OPENAI_VECTOR_STORE_ID=...)

## 2) Deploy no Netlify
1. Suba este projeto no GitHub.
2. Netlify → Add new site → Import from Git.
3. O netlify.toml já define:
   - Publish: public
   - Functions: netlify/functions
4. Configure no Netlify (Site settings → Environment variables):
   - OPENAI_API_KEY = sua chave
   - OPENAI_VECTOR_STORE_ID = o ID do Vector Store

## 3) Logo do Sebrae
Por padrão, o site usa um arquivo placeholder em `public/assets/sebrae-logo.svg`.
Substitua esse arquivo pelo logo oficial que você possui/tem permissão de uso (mantendo o mesmo nome).
