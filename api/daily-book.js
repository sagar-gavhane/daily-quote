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
import { generateBookPrompt } from "../prompts/ai-prompts.js";

const fromEmail = process.env.EMAIL_SENDER;
const toEmails = process.env.EMAIL_RECEIVER.split(",")
  .map((e) => e.trim())
  .join(",");

export default async function sendDailyBookRecommendation(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    const { status, headers, body } = handleMethodNotAllowed(req.method);
    res.setHeader("Allow", headers.Allow);
    return res.status(status).end(body);
  }

  try {
    const book = getRandomBook();
    const model = await createAIModel(BookSummarySchema);

    const prompt = generateBookPrompt(book);
    const response = await model.invoke([new HumanMessage(prompt)]);

    await sendEmail({
      from: `"Daily Book Summary" <${fromEmail}>`,
      to: toEmails,
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
