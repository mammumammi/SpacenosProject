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

  const prompt = `
You are a blockchain intelligence AI. For each transaction:
1. Internally decide the Alert Type: Whale Wallet Move / Normal Transfer / Suspicious Activity.
2. Internally assign Severity: High / Medium / Low based on transaction importance.
3. Then write a **short, clear summary** of what likely happened, without mentioning the alert type or severity.

Example output format (just summaries):
- Large wallet moved 5000 ETH to Binance, indicating possible sell pressure.
- Small transaction between two users on Polygon.
- Unusual token transfer pattern suggests automated trading activity.

Transactions:
${aiContent.join("\n")}
`;

  // Generate content with Gemini SDK
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  // Split into lines and remove empty ones
  const summary = response.text.split("\n").map((s) => s.trim()).filter(Boolean);
  return summary;
};

const aiPriceSummarize = async (tokenDetails) =>{
    const aiContent = tokenDetails.map( (tx,index) => {
        return `token ${index +1},token name: ${tx.id},Token Symbol:${tx.symbol},Token_Current_Price:${tx.current_price},
        Token_price_change in 1h:${tx.price_change_percentage_1h_in_currency},Token_totalVolume:${tx.total_volume},Token_price change in 24h:${tx.price_change_percentage_24h_in_currency}%,Token price change in 7days:${tx.price_change_percentage_7d_in_currency} `
    });

    const prompt = `
You are a professional crypto analyst AI. For each token:
1. Internally decide the Alert Type: (Price Dump / Price Pump / Stable).
2. Internally assign a Severity Level: (High / Medium / Low) based on the strength of the movement.
3. Then, output **only a short natural-language summary sentence**, without mentioning alert type or severity explicitly.

Example output format (do not include the words "Alert Type" or "Severity"):
- Bitcoin shows a quick rebound after a short-term dip.
- Ethereum sees heavy selling pressure from whales.
- Solana remains relatively stable with minor fluctuations.

Tokens:
${aiContent.join("\n")}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    
    });
    const summary = response.text.split("\n").map( (s) => s.trim()).filter(Boolean);
    return summary;
}

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

app.post("/priceSummarize",async (req,res) => {
    try{
        const tokenDetails = req.body.tokenDetails || [];
        const summaries = await aiPriceSummarize(tokenDetails);
        res.json({summaries});
    }   
    catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to generate Ai Price summaries"});
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
