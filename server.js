import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Gemini client with your API key
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const aiSummarize = async (transactions) => {
  // Build a prompt from all transactions
  const aiContent = transactions.map((tx, index) => {
    return `Transaction ${index + 1}, txhash:${tx.hash}, from:${tx.from}, to:${tx.to}, value:${tx.value || tx.amount}, Chain/company:${tx.chain || tx.tokenSymbol}`;
  });

  const prompt = `You are a crypto analyst. Given the following transactions, provide a short AI-summarized text for each transaction. Output each summary on a separate line in the same order as the transactions given:\n\n${aiContent.join("\n")}`;

  // Generate content with Gemini SDK
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  // Split into lines and remove empty ones
  const summary = response.text.split("\n").map((s) => s.trim()).filter(Boolean);
  return summary;
};

app.post("/summarize", async (req, res) => {
  try {
    const transactions = req.body.transactions || [];
    const summaries = await aiSummarize(transactions);
    res.json({ summaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate AI summaries" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
