import { HumanMessage } from "@langchain/core/messages";
import { QuoteSchema } from "../schema/quote-schema.js";
import { createAIModel } from "../utils/ai-service.js";
import { sendEmail } from "../utils/email-service.js";
import { generateQuoteEmailTemplate } from "../utils/email-templates.js";
import {
  handleApiError,
  handleMethodNotAllowed,
} from "../utils/response-handler.js";

export default async function sendDailyQuoteEmail(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    const { status, headers, body } = handleMethodNotAllowed(req.method);
    res.setHeader("Allow", headers.Allow);
    return res.status(status).end(body);
  }

  try {
    const quotes = await fetch("https://api.api-ninjas.com/v1/quotes", {
      method: "GET",
      headers: {
        "X-Api-Key": process.env.API_NINJAS_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!quotes.ok) {
      throw new Error(`Failed to fetch quotes: ${quotes.statusText}`);
    }
    const quotesData = await quotes.json();
    const quote = quotesData.at(0);
    console.log("quote fetched successfully:", quote);

    const model = await createAIModel(QuoteSchema, {
      temperature: 1,
      maxOutputTokens: 2048,
    });
    console.log("Model initialized successfully");

    const prompt = `
      Return a JSON object with "quote", "author", "meaning", and "analogy" fields. The quote and author are provided below - generate meaning and analogy for this specific quote:

      Quote to analyze: "${quote.quote}"
      Author: "${quote.author}"

      Requirements for your response:

      The "quote" field:
      - Use exactly this quote: "${quote.quote}"

      The "author" field:
      - Use exactly this author: "${quote.author}"

      The "meaning" field (50-300 chars):
      - Explain this specific quote's core message and historical context
      - Connect it to personal development
      - Make it practical and actionable for today's world

      The "analogy" field (50-300 chars):
      - Create a simple real-world example that illustrates this specific quote's message
      - Make it relatable to modern life
      - Help readers remember and apply this quote's wisdom

      Return only valid JSON with these four fields.`.trim();

    const response = await model.invoke([new HumanMessage(prompt)]);
    console.log("Response received from model:", response);

    await sendEmail({
      from: `"Daily Inspiration" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "🌟 Your Daily Dose of Historical Wisdom!",
      html: generateQuoteEmailTemplate(response),
    });

    return res.status(200).json({
      message: "Email sent successfully!",
      quote: response.quote.trim(),
      author: response.author.trim(),
      meaning: response.meaning.trim(),
      analogy: response.analogy.trim(),
    });
  } catch (error) {
    const { status, body } = handleApiError(error, "daily quote");
    return res.status(status).json(body);
  }
}
