import { HumanMessage } from "@langchain/core/messages";
import { QuoteSchema } from "../schema/quote-schema.js";
import { createAIModel } from "../utils/ai-service.js";
import { sendEmail } from "../utils/email-service.js";
import { generateQuoteEmailTemplate } from "../utils/email-templates.js";
import {
  handleApiError,
  handleMethodNotAllowed,
} from "../utils/response-handler.js";
import { generateQuotePrompt } from "../prompts/ai-prompts.js";
import { fetchRandomQuote } from "../utils/quote-service.js";

export default async function sendDailyQuoteEmail(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    const { status, headers, body } = handleMethodNotAllowed(req.method);
    res.setHeader("Allow", headers.Allow);
    return res.status(status).end(body);
  }

  try {
    const quote = await fetchRandomQuote();

    const model = await createAIModel(QuoteSchema, {
      temperature: 1,
      maxOutputTokens: 2048,
    });
    console.log("Model initialized successfully");

    const prompt = generateQuotePrompt(quote);
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
