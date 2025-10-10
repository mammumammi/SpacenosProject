// index.js

// 1. Import necessary packages
import 'dotenv/config'; // Loads API key from .env file
import { GoogleGenerativeAI } from "@google/generative-ai";

// 2. Initialize the client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Create an async function to run the model
async function run() {
  try {
    // Get the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Define your prompt
    const prompt = "What is the capital of India and what are three interesting facts about it?";

    console.log("Sending prompt to the AI...");
    
    // Generate content from the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Log the response text
    console.log("\n--- AI Response ---");
    console.log(text);
    console.log("-------------------\n");

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// 4. Call the main function to start the script
run();