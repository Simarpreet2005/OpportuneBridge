import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ["gemini-pro", "gemini-1.5-flash-latest", "gemini-flash-latest"];

    for (const modelName of candidateModels) {
        console.log(`\n--- Testing Model: ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Respond with 'OK'");
            console.log(`SUCCESS [${modelName}]:`, result.response.text());
        } catch (error) {
            console.log(`FAILURE [${modelName}]:`, error.message);
        }
    }
}

testModels();
