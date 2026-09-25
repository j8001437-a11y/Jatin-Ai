require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.get("/", (req, res) => {
  res.json({ name: "Jatin AI", status: "running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    openai_configured: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    if (!client) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server"
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: "You are Jatin AI, a helpful and friendly AI assistant."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: response.output_text || ""
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate a response"
    });
  }
});

app.listen(port, () => {
  console.log(`Jatin AI backend running on port ${port}`);
});
