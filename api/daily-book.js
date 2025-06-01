import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getRandomBook } from "../utils/getRandomBook.js";

export const TopicSchema = z.object({
  title: z.string().describe("Title of the topic"),
  overview: z
    .string()
    .min(200, {
      message: "Topic overview must be at least 200 characters long.",
    })
    .max(500, { message: "Topic overview must be 500 characters or less." })
    .describe("Clear explanation of the topic and its importance"),
  examples: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Real-world examples illustrating the topic"),
  keyTakeaways: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Key insights and lessons from this topic"),
});

export const BookSummarySchema = z.object({
  title: z.string().describe("The title of the book"),
  author: z.string().describe("The author of the book"),
  introduction: z
    .string()
    .min(100)
    .max(300)
    .describe("Brief introduction to the book"),
  topics: z
    .array(TopicSchema)
    .min(5)
    .max(15)
    .describe("Major topics discussed in the book"),
  modernApplication: z
    .string()
    .min(100, {
      message: "Modern application must be at least 100 characters long.",
    })
    .max(500, { message: "Modern application must be 500 characters or less." })
    .describe("How the book's teachings can be applied in modern life"),
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
    const book = getRandomBook();
    console.log("Random book selected:", book);

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: "gemini-2.5-flash-preview-05-20",
      temperature: 0.7,
      topP: 0.8,
      // maxOutputTokens: 2048,
    }).withStructuredOutput(BookSummarySchema);

    const prompt = `
      Act as an expert book summarizer for "${book.title}" by ${book.author} (${book.yearPublished}).
      Provide a structured analysis in your JSON response with the following components:

      1. Title and Author:
         - Use exactly as provided above

      2. Introduction (100-300 chars):
          - Briefly introduce the book
          - Highlight its significance
          - Mention the author's background

      3. Major Topics (2-5 topics):
         For each major topic include:
         a) Topic Title: Clear, concise heading
         b) Overview (100-500 chars):
            - Main concept explanation
            - Historical context
            - Author's perspective
         c) Examples (1-3):
            - Real-world applications
            - Case studies
            - Practical illustrations
         d) Topic Key Takeaways (2-4):
            - Core lessons
            - Practical insights
            - Implementation tips

      5. Modern Application:
         - Contemporary relevance
         - Industry applications
         - Technology context
         - Professional development

      Format content professionally and maintain technical accuracy.
      Return valid JSON matching the schema requirements.`.trim();

    const response = await model.invoke([new HumanMessage(prompt)]);
    console.log("Response received from model:", response);

    const mailOptions = {
      from: `"Daily Book Summary" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `📚 Today's Book Summary: ${response.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc;">
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a202c; max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header Section -->
            <header style="text-align: center; margin-bottom: 2em;">
              <h1 style="color: #2d3748; font-size: 28px; margin: 0;">📚 Daily Book Summary</h1>
              <p style="color: #718096; font-size: 16px; margin-top: 0.5em;">Your daily dose of wisdom</p>
            </header>

            <!-- Book Title Card -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2em; border-radius: 12px; margin-bottom: 2em; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h1 style="font-size: 24px; margin: 0; font-weight: 600;">${
                response.title
              }</h1>
              <h2 style="font-size: 18px; margin: 0.5em 0; font-weight: 400; opacity: 0.9;">by ${
                response.author
              }</h2>
              <div style="font-size: 14px; margin-top: 1em; opacity: 0.8;">${
                book.genre
              } • ${book.yearPublished}</div>
            </div>

            <!-- Introduction Section -->
            <section style="background: white; padding: 1.5em; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin-bottom: 2em;">
              <h2 style="color: #2d3748; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em;">📖 Introduction</h2>
              <p style="color: #4a5568; line-height: 1.8;">${
                response.introduction
              }</p>
            </section>

            <!-- Topics Section -->
            ${response.topics
              .map(
                (topic, index) => `
              <section style="background: white; padding: 1.5em; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin-bottom: 2em;">
                <h2 style="color: #2d3748; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em;">
                  📑 ${topic.title}
                </h2>

                <!-- Overview -->
                <div style="margin-bottom: 1.5em;">
                  <h3 style="color: #4a5568; font-size: 18px; margin: 1em 0 0.5em;">Overview</h3>
                  <p style="color: #4a5568; line-height: 1.8; margin: 0;">${
                    topic.overview
                  }</p>
                </div>

                <!-- Examples -->
                <div style="margin-bottom: 1.5em; background: #f7fafc; padding: 1em; border-radius: 6px;">
                  <h3 style="color: #4a5568; font-size: 18px; margin: 0 0 0.5em;">Practical Examples</h3>
                  <ul style="margin: 0; padding-left: 1.5em; color: #4a5568;">
                    ${topic.examples
                      .map(
                        (example) => `
                      <li style="margin-bottom: 0.5em;">${example}</li>
                    `
                      )
                      .join("")}
                  </ul>
                </div>

                <!-- Key Takeaways -->
                <div style="background: #f7fafc; padding: 1em; border-radius: 6px;">
                  <h3 style="color: #4a5568; font-size: 18px; margin: 0 0 0.5em;">Key Insights</h3>
                  <ul style="margin: 0; padding-left: 1.5em; color: #4a5568;">
                    ${topic.keyTakeaways
                      .map(
                        (takeaway) => `
                      <li style="margin-bottom: 0.5em;">${takeaway}</li>
                    `
                      )
                      .join("")}
                  </ul>
                </div>
              </section>
            `
              )
              .join("")}

            <!-- Modern Application Section -->
            <section style="background: white; padding: 1.5em; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin-bottom: 2em;">
              <h2 style="color: #2d3748; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em;">🌟 Modern Application</h2>
              <p style="color: #4a5568; line-height: 1.8;">${
                response.modernApplication
              }</p>
            </section>

            <!-- Footer -->
            <footer style="text-align: center; margin-top: 3em; padding-top: 2em; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                Daily Book Summary Bot • Crafted with 💜 for continuous learning
              </p>
              <p style="color: #718096; font-size: 12px; margin: 0.5em 0 0;">
                To unsubscribe, reply with "STOP"
              </p>
            </footer>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    return res.status(200).json({
      message: "Email sent successfully!",
      book: {
        title: response.title,
        author: response.author,
        summary: response.summary,
        keyTakeaways: response.keyTakeaways,
        modernApplication: response.modernApplication,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error.message || "An internal server error occurred.";
    const errorStack = error.stack;

    return res.status(500).json({
      error: "Failed to send daily book summary",
      details: errorMessage,
      stack: errorStack,
    });
  }
}
