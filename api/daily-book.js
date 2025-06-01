import { HumanMessage } from "@langchain/core/messages";
import { BookSummarySchema } from "../schema/book-schema.js";
import { createAIModel } from "../utils/ai-service.js";
import { sendEmail } from "../utils/email-service.js";
import { generateBookEmailTemplate } from "../utils/email-templates.js";
import {
  handleApiError,
  handleMethodNotAllowed,
} from "../utils/response-handler.js";
import { getRandomBook } from "../utils/get-random-book.js";

export default async function sendDailyBookRecommendation(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    const { status, headers, body } = handleMethodNotAllowed(req.method);
    res.setHeader("Allow", headers.Allow);
    return res.status(status).end(body);
  }

  try {
    const book = getRandomBook();
    const model = await createAIModel(BookSummarySchema);

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

    await sendEmail({
      from: `"Daily Book Summary" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `📚 Today's Book Summary: ${response.title}`,
      html: generateBookEmailTemplate(response, book),
    });

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
    const { status, body } = handleApiError(error, "daily book summary");
    return res.status(status).json(body);
  }
}
