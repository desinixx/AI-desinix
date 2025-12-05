const $ = (sel) => document.querySelector(sel);
const messagesEl = $("#messages");
const inputEl = $("#userInput");
const sendBtn = $("#sendBtn");
const newChatBtn = $("#newChatBtn");
const loadingIndicator = $("#loadingIndicator");
const welcomeEl = $("#welcomeMessage"); // New element selector

let messages = []; 
let isTyping = false;

// Function to automatically resize textarea
function autoResizeTextarea() {
    inputEl.style.height = 'auto'; 
    const newHeight = Math.min(inputEl.scrollHeight, 150);
    inputEl.style.height = `${newHeight}px`;
}

function render() {
  messagesEl.innerHTML = "";
  for (const m of messages) {
    const item = document.createElement("div");
    item.className = `message ${m.role}`;
    
    // Simple markdown parsing
    const formatted = m.content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    
    item.innerHTML = formatted;
    messagesEl.appendChild(item);
  }
  // Scroll to bottom after the message is fully rendered
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showLoading() { loadingIndicator.style.display = "flex"; }
function hideLoading() { loadingIndicator.style.display = "none"; }

function resetChat() {
    messages = [];
    messagesEl.innerHTML = "";
    inputEl.value = "";
    autoResizeTextarea();
    inputEl.focus();
    // Show welcome message on new chat
    welcomeEl.style.display = "flex";
}

// Function to hide the welcome message (called after first user send)
function hideWelcome() {
    if (welcomeEl.style.display !== "none") {
        welcomeEl.style.display = "none";
    }
}

async function send() {
  const text = inputEl.value.trim();
  if (!text || isTyping) return;

  // HIDE THE WELCOME MESSAGE ON THE FIRST SEND
  hideWelcome();

  messages.push({ role: "user", content: text });
  inputEl.value = "";
  autoResizeTextarea();
  render();
  
  showLoading();

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (!res.ok) {
      hideLoading();
      messages.push({ role: "assistant", content: "Error: " + (await res.text()) });
      render();
      return;
    }

    const data = await res.json();
    const reply = data.text || "(No response)";
    hideLoading();
    await typeMessage(reply);
    
  } catch (e) {
    hideLoading();
    messages.push({ role: "assistant", content: "Connection error. Please try again." });
    render();
  }
}

async function typeMessage(text) {
  const div = document.createElement("div");
  div.className = "message assistant";
  messagesEl.appendChild(div);
  
  isTyping = true;
  
  // Faster typing for professional feel
  const chunkSize = 2; 
  
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.substring(0, i + chunkSize);
    div.innerHTML = chunk
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
      
    // --- SCROLLING LOGIC REMOVED HERE ---
    // The previous auto-scroll logic during typing has been commented out/removed
    // This implements the requested change to disable auto-scroll during agent reply.
    
    await new Promise((r) => setTimeout(r, 10)); // Faster typing
  }
  
  // Ensure full text is set at the end
  div.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
      
  messages.push({ role: "assistant", content: text });
  isTyping = false;
  // Final scroll once message is complete
  messagesEl.scrollTop = messagesEl.scrollHeight; 
}

// --- Event Listeners ---
sendBtn.addEventListener("click", send);
newChatBtn.addEventListener("click", resetChat);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

inputEl.addEventListener("input", autoResizeTextarea);

window.onload = () => {
    autoResizeTextarea();
    inputEl.focus();
    // Ensure welcome message is visible on load if no initial messages exist
    if (messages.length === 0) {
        welcomeEl.style.display = "flex";
    }
};
