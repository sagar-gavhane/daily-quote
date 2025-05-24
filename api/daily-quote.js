import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import nodemailer from "nodemailer";
import { z } from "zod";

const QuoteSchema = z.object({
  quote: z
    .string()
    .min(15, { message: "Quote must be at least 15 characters long." })
    .max(300, { message: "Quote must be 300 characters or less." })
    .describe(
      "The inspirational quote itself. It should be concise, uplifting, and directly usable without any additional text or quotation marks around the string itself unless part of the quote."
    ),
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
    const model = await new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: "gemini-2.5-flash-preview-04-17",
      temperature: 0.7,
      //maxOutputTokens: 1024,
    }).withStructuredOutput(QuoteSchema);
    console.log("Model initialized successfully");

    const prompt = `
      Return a JSON object with exactly these three fields: "quote", "meaning", and "analogy". Each field should be a string that meets these requirements:

      The "quote" field (15-300 chars):
      - An original inspirational message
      - Focus on personal growth or resilience
      - Use clear, concise language
      - Avoid clichés
      - Have a memorable quality

      The "meaning" field (50-300 chars):
      - Explain the core message
      - Connect to personal development
      - Make it practical and actionable

      The "analogy" field (50-300 chars):
      - Use a simple real-world example
      - Make it relatable
      - Help remember the message

      Return only valid JSON with these three fields.`.trim();

    const response = await model.invoke([new HumanMessage(prompt)]);
    console.log("Response received from model:", response);
    const mailOptions = {
      from: `"Daily Inspiration" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "🌟 Your Daily Dose of Wisdom!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Good Morning!</h2>
            <p>Here's your inspirational quote for the day:</p>
            <blockquote style="border-left: 4px solid #3498db; padding-left: 1em; margin-left: 0; font-style: italic; color: #555;">
              ${response.quote.trim()}
            </blockquote>

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
