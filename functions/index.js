const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors')({ origin: true });

// Read API key from environment variable (set via firebase functions:config:set or Secret Manager)
// For Secret Manager (recommended):
// firebase ext:install googlecloud/gemini-api
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || functions.config().gemini.apikey;

exports.askGemini = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { prompt, history } = req.body;
      
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const chat = model.startChat({
        history: history || [],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      return res.status(200).json({ response: text });
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      return res.status(500).json({ error: "Failed to fetch response from AI." });
    }
  });
});
