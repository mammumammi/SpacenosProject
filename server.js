import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";
import serviceAccount from "./service_account.json" with { type: "json" };
dotenv.config();


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
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
You are a blockchain intelligence AI analyst. For each transaction provided, return a JSON array of objects.
Each object must have three keys: "summary" (a short, natural-language sentence explaining what happened), "alertType" ("Whale Wallet Move", "Normal Transfer", or "Suspicious Activity"), and "severity" ("High", "Medium", or "Low").
Do not include markdown formatting like \`\`\`json.

Example output:
[
  {
    "summary": "Large wallet moved 5,000 ETH to a centralized exchange, indicating possible sell pressure.",
    "alertType": "Whale Wallet Move",
    "severity": "High"
  },
  {
    "summary": "A small, routine transaction occurred between two previously interacting wallets.",
    "alertType": "Normal Transfer",
    "severity": "Low"
  }
]

Transactions:
${aiContent.join("\n")}
`;

  // Generate content with Gemini SDK
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let text = response.text;
  text = text.replace(/'''json/g,"").replace(/'''/g,"").trim();
  const structuredSummary = JSON.parse(text);
  return structuredSummary;
};

const aiPriceSummarize = async (tokenDetails) =>{
    
    const aiContent = tokenDetails.map( (tx,index) => {
        return `token ${index +1},token name: ${tx.id},Token Symbol:${tx.symbol},Token_Current_Price:${tx.current_price},
        Token_price_change in 1h:${tx.price_change_percentage_1h_in_currency},Token_totalVolume:${tx.total_volume},Token_price change in 24h:${tx.price_change_percentage_24h_in_currency}%,Token price change in 7days:${tx.price_change_percentage_7d_in_currency} `
    });

    const prompt = `
You are a professional crypto analyst AI. For each token provided, return a JSON array of objects.
Each object must have three keys: "summary" (a short, natural-language sentence), "alertType" (e.g., "Price Dump", "Price Pump", "Stable"), and "severity" ("High", "Medium", or "Low").
Do not include markdown formatting.

Example output:
[
  {
    "summary": "Bitcoin shows a quick rebound with 35% increase in price after a short-term dip of -10%.",
    "alertType": "Stable",
    "severity": "Low"
  },
  {
    "summary": "Ethereum sees heavy selling pressure from whales due to 10m worth of eth selloff",
    "alertType": "Price Dump",
    "severity": "High"
  }
]

Tokens:
${aiContent.join("\n")}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    
    });
    let text = response.text;
  text = text.replace(/'''json/g,"").replace(/'''/g,"").trim();
  const structuredSummary = JSON.parse(text);
  return structuredSummary;
}

const saveToFireStore = async (eventData) => {
    try {
        const eventWithTimestamps = {
            ...eventData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection("events").add(eventWithTimestamps);
        console.log("Event stored in firestore db with id:",docRef.id);
    }
    catch(err){
        console.log("Error when uplooading to the firestore db:",err);
    }
}

app.post("/summarize", async (req, res) => {
    try{
        const transactions = req.body.transactions || [];
        if (transactions.length === 0){
            return res.json({summaries: []});
        }

        const structuredSummary = await aiSummarize(transactions);
        for (let i =0;i<structuredSummary.length;i++){
            const transaction = transactions[i];
            const analysis = structuredSummary[i];

            const eventData = {
                hash: transaction.hash,       
                token: transaction.tokenSymbol,
                amount: transaction.amount || transaction.value,
                from: transaction.from,
                to: transaction.to,
                chain: transaction.chain,
                
               
                
                alertType: analysis.alertType,
                severity: analysis.severity,
                summary: analysis.summary
            }
            await saveToFireStore(eventData);
        };
        const summaries = structuredSummary.map( s => s.summary);
        res.json({summaries});
    }   
    catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate AI summaries" });
  }
});

app.post("/priceSummarize",async (req,res) => {
    try{
        const tokenDetails = req.body.tokenDetails || [];
        if (tokenDetails.length === 0){
            return res.json({summaries: []});
        }

        const structuredSummary = await aiPriceSummarize(tokenDetails);
        for (let i =0;i<tokenDetails.length;i++){
            const token = tokenDetails[i];
            const analysis = structuredSummary[i] || {
                summary: "AI summary could not be generated for this token.",
                alertType: "Error",
                severity: "Low"
            };

            const eventData = {
                chain: token.id,
                token: token.symbol,
                price: token.current_price,
                volume: token.total_volume,

                alertType: analysis.alertType,
                severity:analysis.severity
            }
            await saveToFireStore(eventData);
        }
        const summaries = structuredSummary.map( s => s.summary);
        res.json({summaries});
    }   
    catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to generate Ai Price summaries"});
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
