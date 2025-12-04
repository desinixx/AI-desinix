const $ = (sel) => document.querySelector(sel);
const messagesEl = $("#messages");
const inputEl = $("#userInput");
const sendBtn = $("#sendBtn");
const loadingIndicator = $("#loadingIndicator");

// Removed history, currentThreadId, exportBtn, deleteHistoryBtn, historyList, newChatBtn, menuBtn, sidebar, overlay

let messages = JSON.parse(localStorage.getItem("desinix_chat_messages") || "[]");
let isTyping = false;

// Function to automatically resize textarea
function autoResizeTextarea() {
    inputEl.style.height = 'auto'; // Reset height
    // Calculate new height, capping it at the max-height defined in CSS (120px)
    const newHeight = Math.min(inputEl.scrollHeight, 120);
    inputEl.style.height = `${newHeight}px`;
}

function save() {
  localStorage.setItem("desinix_chat_messages", JSON.stringify(messages));
  // Removed history and currentThreadId save
}

function render() {
  messagesEl.innerHTML = "";
  for (const m of messages) {
    const item = document.createElement("div");
    item.className = `message ${m.role}`;
    // Replace Markdown before injecting
    const formatted = m.content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    item.innerHTML = formatted;
    messagesEl.appendChild(item);
  }
  // Scroll to bottom after rendering
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showLoading() { loadingIndicator.style.display = "block"; }
function hideLoading() { loadingIndicator.style.display = "none"; }

async function send() {
  const text = inputEl.value.trim();
  if (!text || isTyping) return;

  messages.push({ role: "user", content: text });
  inputEl.value = "";
  autoResizeTextarea(); // Reset textarea size after sending
  render(); save();
  showLoading();

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (!res.ok) {
      hideLoading();
      messages.push({ role: "assistant", content: "API error: " + (await res.text()) });
      render(); save();
      return;
    }

    const data = await res.json();
    const reply = data.text || "(No response)";
    hideLoading();
    await typeMessage(reply);
    save();
  } catch (e) {
    hideLoading();
    messages.push({ role: "assistant", content: "Network error: " + e.message });
    render(); save();
  }
}

async function typeMessage(text) {
  const div = document.createElement("div");
  div.className = "message assistant";
  messagesEl.appendChild(div);
  const bubble = div;

  isTyping = true;
  for (let i = 0; i < text.length; i++) {
    bubble.innerHTML = text
      .substring(0, i + 1)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    messagesEl.scrollTop = messagesEl.scrollHeight;
    await new Promise((r) => setTimeout(r, 15));
  }
  messages.push({ role: "assistant", content: text });
  isTyping = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// --- Event Listeners ---
sendBtn.addEventListener("click", send);

// Handle Enter to send, Shift+Enter for new line
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// Auto-resize on input
inputEl.addEventListener("input", autoResizeTextarea);


/* INIT */
// History initialization logic removed, only render existing messages
render();
window.onload = () => {
    // Initial size calculation and focus
    autoResizeTextarea();
    inputEl.focus();
};
