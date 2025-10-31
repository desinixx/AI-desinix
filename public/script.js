const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  chatContainer.appendChild(userMsg);

  userInput.value = "";
  chatContainer.scrollTop = chatContainer.scrollHeight;

  setTimeout(() => {
    const aiMsg = document.createElement("div");
    aiMsg.className = "message ai";
    aiMsg.textContent = "Thinking...";
    chatContainer.appendChild(aiMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 600);
});
