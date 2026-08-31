const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Google Gen AI with key from .env
// We handle missing keys gracefully to reflect reality (tinkerer rule)
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is not set in .env file.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { systemInstruction, history, message } = req.body;
        
        // GoogleGenAI SDK format expects contents array
        // We inject the system instruction if the model supports it.
        // For gemini-3.1-flash, we can pass systemInstruction in config
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash',
            contents: [
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })),
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemInstruction,
            }
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
