const $ = (sel) => document.querySelector(sel);
const messagesEl = $("#messages");
const inputEl = $("#userInput");
const sendBtn = $("#sendBtn");
const exportBtn = $("#exportBtn");
const deleteHistoryBtn = $("#deleteHistory");
const historyList = $("#historyList");
const newChatBtn = $("#newChatBtn");

let messages = JSON.parse(localStorage.getItem("desinix_chat_messages") || "[]");
let history = JSON.parse(localStorage.getItem("desinix_chat_history") || "[]");
let currentThreadId = localStorage.getItem("desinix_current_thread") || null;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function save() {
  localStorage.setItem("desinix_chat_messages", JSON.stringify(messages));
  localStorage.setItem("desinix_chat_history", JSON.stringify(history));
  if (currentThreadId) localStorage.setItem("desinix_current_thread", currentThreadId);
}

// ✅ Markdown-friendly render
function render() {
  messagesEl.innerHTML = "";
  for (const m of messages) {
    const item = document.createElement("div");
    item.className = "message";

    const formatted = m.content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")  // bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>")              // italic
      .replace(/\n/g, "<br>");                           // line breaks

    item.innerHTML = `
      <div class="role">${m.role === "user" ? "You" : "Desinix"}</div>
      <div class="bubble">${formatted}</div>
    `;
    messagesEl.appendChild(item);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;

  messages.push({ role: "user", content: text });
  inputEl.value = "";
  render(); save();

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (!res.ok) {
      const err = await res.text();
      messages.push({ role: "assistant", content: "API error: " + err });
      render(); save();
      return;
    }

    const data = await res.json();
    const reply = data.text || "(No response)";
    messages.push({ role: "assistant", content: reply });
    render(); save();
  } catch (e) {
    messages.push({ role: "assistant", content: "Network error: " + e.message });
    render(); save();
  }
}

function newThread() {
  currentThreadId = uid();
  history.unshift({
    id: currentThreadId,
    title: messages.find((m) => m.role === "user")?.content?.slice(0, 40) || "New chat",
    createdAt: Date.now()
  });
  messages = [];
  save();
  render();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  for (const item of history) {
    const li = document.createElement("li");
    li.textContent = item.title;
    li.onclick = () => {
      currentThreadId = item.id;
      render();
      save();
    };
    historyList.appendChild(li);
  }
}

function exportChat() {
  const blob = new Blob([JSON.stringify({ messages }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "desinix-chat.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Event Listeners
sendBtn.addEventListener("click", send);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
exportBtn.addEventListener("click", exportChat);
deleteHistoryBtn.addEventListener("click", () => {
  history = [];
  save();
  renderHistory();
});
newChatBtn.addEventListener("click", newThread);

// Init
if (!currentThreadId) newThread();
render();
renderHistory();
window.onload = () => inputEl.focus();
