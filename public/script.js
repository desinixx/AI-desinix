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

  // Simulated AI reply
  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.className = "message assistant";
    aiMsg.textContent = "This is a sample response for: " + text;
    chat.appendChild(aiMsg);
    chat.scrollTop = chat.scrollHeight;
  }, 600);
});
