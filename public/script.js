const $ = (sel) => document.querySelector(sel);
const messagesEl = $("#messages");
const inputEl = $("#userInput");
const sendBtn = $("#sendBtn");
const newChatBtn = $("#newChatBtn");
const loadingIndicator = $("#loadingIndicator");

// No Local Storage.
let messages = []; 
let isTyping = false;

function autoResizeTextarea() {
    inputEl.style.height = 'auto'; 
    const newHeight = Math.min(inputEl.scrollHeight, 180);
    inputEl.style.height = `${newHeight}px`;
}

// Smart Scroll Logic: Returns true if user is within 100px of bottom
function isNearBottom() {
    const threshold = 100;
    const position = window.scrollY + window.innerHeight;
    const height = document.documentElement.scrollHeight;
    return height - position <= threshold;
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function displayWelcomeMessage() {
    const welcomeHTML = `
        <div class="welcome-message">
            <h1>Welcome to <span>Desinix</span> AI</h1>
            <p>Start a new conversation below. Your chat history is transient and will not be saved.</p>
        </div>
    `;
    messagesEl.innerHTML = welcomeHTML;
}

function render() {
  messagesEl.innerHTML = "";
  
  if (messages.length === 0) {
      displayWelcomeMessage();
      return;
  }
  
  for (const m of messages) {
    const item = document.createElement("div");
    item.className = `message ${m.role}`;
    
    const formatted = m.content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/\n/g, "<br>");
    
    item.innerHTML = formatted;
    messagesEl.appendChild(item);
  }
}

function showLoading() { loadingIndicator.style.display = "flex"; }
function hideLoading() { loadingIndicator.style.display = "none"; }

function resetChat() {
    if (isTyping) return;
    messages = [];
    render();
    inputEl.value = "";
    autoResizeTextarea();
    inputEl.focus();
}

async function send() {
  const text = inputEl.value.trim();
  if (!text || isTyping) return;

  messages.push({ role: "user", content: text });
  inputEl.value = "";
  autoResizeTextarea();
  render();
  scrollToBottom(); // Force scroll on user send
  
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
      scrollToBottom();
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
    scrollToBottom();
  }
}

async function typeMessage(text) {
  const div = document.createElement("div");
  div.className = "message assistant";
  messagesEl.appendChild(div);
  
  isTyping = true;
  
  const chunkSize = 3; 
  let shouldAutoScroll = isNearBottom();

  for (let i = 0; i < text.length; i += chunkSize) {
    // Check if user has scrolled away
    shouldAutoScroll = isNearBottom();

    const chunk = text.substring(0, i + chunkSize);
    div.innerHTML = chunk
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/\n/g, "<br>");
    
    // Only scroll if user was already at the bottom
    if (shouldAutoScroll) {
        window.scrollTo(0, document.body.scrollHeight);
    }
    
    await new Promise((r) => setTimeout(r, 8)); 
  }
  
  // Final render to ensure HTML validity
  div.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/\n/g, "<br>");
      
  messages.push({ role: "assistant", content: text });
  
  // Final scroll check
  if (shouldAutoScroll) {
       window.scrollTo(0, document.body.scrollHeight);
  }

  isTyping = false;
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
    // Initial render displays the welcome message since messages.length is 0
    render();
    autoResizeTextarea();
    inputEl.focus();
};
