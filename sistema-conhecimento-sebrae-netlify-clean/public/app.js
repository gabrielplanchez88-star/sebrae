const log = document.getElementById("log");
const form = document.getElementById("form");
const msg = document.getElementById("msg");
const clearBtn = document.getElementById("clear");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const history = [];

function setStatus(mode, text){
  statusText.textContent = text;
  statusDot.style.background =
    mode === "busy" ? "rgba(245,158,11,.95)" : "rgba(34,197,94,.9)";
}

function add(role, text){
  const row = document.createElement("div");
  row.className = `row ${role === "user" ? "you" : "bot"}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
  return bubble;
}

async function sendMessage(text){
  add("user", text);
  history.push({ role: "user", content: text });

  setStatus("busy", "Consultando base...");
  const bubble = add("assistant", "Consultando os materiais...");

  const r = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, history })
  });

  const data = await r.json();
  const answer = data?.text || data?.error || "Sem resposta.";

  bubble.textContent = answer;
  history.push({ role: "assistant", content: answer });

  if (history.length > 24) history.splice(0, history.length - 24);
  setStatus("ready", "Pronto");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = msg.value.trim();
  if (!text) return;
  msg.value = "";
  msg.focus();
  try{
    await sendMessage(text);
  }catch{
    add("assistant", "Erro ao conectar no servidor.");
    setStatus("ready", "Pronto");
  }
});

clearBtn.addEventListener("click", () => {
  history.length = 0;
  log.innerHTML = "";
  add("assistant", "Olá! Faça uma pergunta sobre os materiais do Projeto Sebrae.");
});

add("assistant", "Olá! Faça uma pergunta sobre os materiais do Projeto Sebrae.");
