import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import nodemailer from "nodemailer";
import { z } from "zod";

export const QuoteSchema = z.object({
  quote: z
    .string()
    .min(15, { message: "Quote must be at least 15 characters long." })
    .max(300, { message: "Quote must be 300 characters or less." })
    .describe(
      "The historical quote itself, exactly as spoken/written by the notable figure."
    ),
  author: z
    .string()
    .min(2, { message: "Author name must be at least 2 characters long." })
    .max(100, { message: "Author name must be 100 characters or less." })
    .describe("The full name of the historical figure who made the quote."),
  meaning: z
    .string()
    .min(50, { message: "Meaning must be at least 50 characters long." })
    .max(300, { message: "Meaning must be 300 characters or less." })
    .describe(
      "A clear explanation of the quote's deeper meaning and its relevance to personal growth."
    ),
  analogy: z
    .string()
    .min(50, { message: "Analogy must be at least 50 characters long." })
    .max(300, { message: "Analogy must be 300 characters or less." })
    .describe(
      "A relatable real-world analogy that helps explain the quote's message."
    ),
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
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

    const model = await new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: "gemini-2.5-flash-preview-05-20",
      temperature: 1,
      topP: 0.8,
      maxOutputTokens: 2048, // Enable longer responses for better variety
    }).withStructuredOutput(QuoteSchema);
    console.log("Model initialized successfully");

    // Add timestamp and random seed for uniqueness
    const timestamp = new Date().toISOString();
    const randomSeed = Math.random().toString(36).substring(7);

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
    const mailOptions = {
      from: `"Daily Inspiration" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "🌟 Your Daily Dose of Historical Wisdom!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Good Morning!</h2>
            <p>Here's your historical quote for the day:</p>
            <blockquote style="border-left: 4px solid #3498db; padding-left: 1em; margin-left: 0; font-style: italic; color: #555;">
              ${response.quote.trim()}
            </blockquote>
            <p style="text-align: right; color: #7f8c8d; font-style: italic;">— ${response.author.trim()}</p>

            <div style="background-color: #f9f9f9; padding: 1em; border-radius: 5px; margin: 1em 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">💡 Meaning</h3>
              <p style="margin-bottom: 0;">${response.meaning.trim()}</p>
            </div>

            <div style="background-color: #f5f6fa; padding: 1em; border-radius: 5px; margin: 1em 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">🎯 Real-World Analogy</h3>
              <p style="margin-bottom: 0;">${response.analogy.trim()}</p>
            </div>

            <p>Have a wonderful and inspiring day!</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 0.9em; color: #7f8c8d;">
                Automated message by your Vercel Daily Quote Bot.
            </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    return res.status(200).json({
      message: "Email sent successfully!",
      quote: response.quote.trim(),
      author: response.author.trim(),
      meaning: response.meaning.trim(),
      analogy: response.analogy.trim(),
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error.message || "An internal server error occurred.";
    const errorStack = error.stack;

    return res.status(500).json({
      error: "Failed to send daily quote",
      details: errorMessage,
      stack: errorStack,
    });
  }
}
