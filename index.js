require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

const PROMPTS = {
  concise: `You are a document summarizer. Summarize the document in 3–5 clear, information-dense sentences. Then list exactly 3 key takeaways as short phrases.

Respond in this exact format:
SUMMARY:
<your summary here>

TAKEAWAYS:
- <takeaway 1>
- <takeaway 2>
- <takeaway 3>`,

  detailed: `You are a document summarizer. Write a thorough summary covering all major sections, arguments, and conclusions. Organize clearly with short paragraphs. Then list exactly 3 key takeaways.

Respond in this exact format:
SUMMARY:
<your detailed summary here>

TAKEAWAYS:
- <takeaway 1>
- <takeaway 2>
- <takeaway 3>`,

  bullets: `You are a document summarizer. Extract the most important points as a clean bulleted list (8–12 bullets). Then list exactly 3 key takeaways.

Respond in this exact format:
SUMMARY:
• <point 1>
• <point 2>
• <point 3>
(continue for all points)

TAKEAWAYS:
- <takeaway 1>
- <takeaway 2>
- <takeaway 3>`,

  eli5: `You are a document summarizer. Explain this document in plain, simple language — short sentences, no jargon, like explaining to a friend. Then list exactly 3 key takeaways.

Respond in this exact format:
SUMMARY:
<your plain-language summary here>

TAKEAWAYS:
- <takeaway 1>
- <takeaway 2>
- <takeaway 3>`,
};

function parseResponse(text) {
  const summaryMatch = text.match(/SUMMARY:\n([\s\S]*?)\n\nTAKEAWAYS:/);
  const takeawaysMatch = text.match(/TAKEAWAYS:\n([\s\S]*?)$/);

  const summary = summaryMatch ? summaryMatch[1].trim() : text.trim();
  const takeawaysRaw = takeawaysMatch ? takeawaysMatch[1].trim() : "";
  const takeaways = takeawaysRaw
    .split("\n")
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  return { summary, takeaways };
}

app.post("/summarize", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded." });
    if (req.file.mimetype !== "application/pdf")
      return res.status(400).json({ error: "File must be a PDF." });

    const { type = "concise" } = req.body;
    const prompt = PROMPTS[type] || PROMPTS.concise;

    let pdfData;
    try {
      pdfData = await pdfParse(req.file.buffer);
    } catch {
      return res.status(422).json({ error: "Could not read this PDF. It may be scanned or image-based." });
    }

    const text = pdfData.text?.trim();
    if (!text || text.length < 50)
      return res.status(422).json({ error: "No readable text found. PDF may be image-based." });

    const truncated =
      text.length > 15000
        ? text.slice(0, 15000) + "\n\n[Document truncated]"
        : text;

    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: `${prompt}\n\n---\n\n${truncated}` }],
    });

    const raw = message.content.find((b) => b.type === "text")?.text || "";
    const { summary, takeaways } = parseResponse(raw);

    res.json({ summary, takeaways, pages: pdfData.numpages, wordCount, readingTime });
  } catch (err) {
    console.error(err);
    if (err.status === 401)
      return res.status(500).json({ error: "Invalid API key. Check your .env file." });
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
