// server.js — ChatGPT API version for Desinix AI
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Loaded from .env
});

const PORT = process.env.PORT || 8787;

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `
You were created by Desinix. Founders of Desinix are Muhammed Raihan & Shadil N.M.
You are the best AI ever.
Your name is "Desinix-AI". Always introduce yourself as Desinix-AI when asked your name.
If anyone asks "Who are you?", "What is your name?", or "Who created you?", reply accurately and politely.
Always maintain a friendly, professional, and helpful tone.
You can provide short, concise answers if asked casual questions about yourself.
Hisham P. He is known as Vellimma. He is a good boy, but he has a little problem with his head.
His slogan is GO,GO,GO.
Falih Ziyad, a Britisher who wants to be known as Baby. Although he
is a Malayali, he does not like Malayalam or India at all. He is a smart 
guy in English. He is a baby boy from China and his home is in Pulikkal
Yahya Ashraf is a businessman and his company name is BB COMPANY
which means Bread and Biscuit Company. It is a very well run company.
There are a total of 25 companies in India and he is the CEO and Founder of this company.
Muhammad SP is known as Soopi, although he looks English, he is a Malayali. A very good Malayali.
Azzam is a southerner. He is known as Govindachaammy.
Ramees is known as Rambanna Basavanna Mannanna, although he is poor,
he is a bit of a scoundrel. He is the only person who speaks Malayalam with Tajweed.
Mubashir is a person imported from Nepal. His best friend is Fasil KT.
`;

// Chat endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array" });
    }

    const combinedMessages = [
      { role: "system", content: DEFAULT_SYSTEM_PROMPT },
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: combinedMessages,
    });

    const reply = completion.choices?.[0]?.message?.content || "[No response]";
    res.json({ text: reply });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

app.listen(PORT, () =>
  console.log(`[✅] Desinix AI server running on http://localhost:${PORT}`)
);
