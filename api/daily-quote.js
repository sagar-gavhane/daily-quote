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
      model: "gemini-2.0-flash",
      temperature: 0.7,
      maxOutputTokens: 100,
    }).withStructuredOutput(QuoteSchema);
    console.log("Model initialized successfully");

    const prompt =
      "Generate a short, uplifting, and inspiring quote for the day. Make it unique and thoughtful.";

    const response = await model.invoke([new HumanMessage(prompt)]);
    console.log("Response received from model:", response);

    const { quote } = response;

    if (!quote || typeof quote !== "string" || quote.trim() === "") {
      console.error("Failed to generate a valid quote.");
      return res.status(500).json({ error: "Failed to generate quote" });
    }

    const mailOptions = {
      from: `"Daily Inspiration" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "🌟 Your Exact Daily Dose of Inspiration!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2c3e50;">Good Morning!</h2>
            <p>Here's your inspirational quote for the day:</p>
            <blockquote style="border-left: 4px solid #3498db; padding-left: 1em; margin-left: 0; font-style: italic; color: #555;">
              ${quote.trim()}
            </blockquote>
            <p>Have a wonderful day!</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 0.9em; color: #7f8c8d;">
                Automated message by your Vercel Daily Quote Bot.
            </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    return res
      .status(200)
      .json({ message: "Email sent successfully!", quote: quote.trim() });
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
