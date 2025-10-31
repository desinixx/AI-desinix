const chatForm = document.getElementById("chat-form");
const chat = document.getElementById("chat");
const input = document.getElementById("user-input");

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text === "") return;

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  chat.appendChild(userMsg);

  input.value = "";

  // Simulated AI rich response
  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.className = "message assistant";

    // Example: rich response (table, list, emoji, hr)
    aiMsg.innerHTML = `
      <p>Here’s an example of formatted output for <b>${text}</b> 👇</p>
      <ul>
        <li>⭐ Point 1</li>
        <li>🔥 Point 2</li>
        <li>🚀 Point 3</li>
      </ul>
      <hr>
      <table>
        <tr><th>Item</th><th>Value</th></tr>
        <tr><td>Text</td><td>${text}</td></tr>
        <tr><td>Emoji</td><td>😎</td></tr>
        <tr><td>Status</td><td>✅ Working</td></tr>
      </table>
    `;
    chat.appendChild(aiMsg);
    chat.scrollTop = chat.scrollHeight;
  }, 600);
});
