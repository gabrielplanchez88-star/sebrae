async function send() {
  const input = document.getElementById('input');
  const chat = document.getElementById('chat');

  chat.innerHTML += `<p><b>Você:</b> ${input.value}</p>`;

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: input.value })
  });

  const data = await res.json();
  chat.innerHTML += `<p><b>Sebrae:</b> ${data.answer}</p>`;
  input.value = '';
}