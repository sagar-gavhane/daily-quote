import { HumanMessage } from "@langchain/core/messages";
import { generateWordPrompt } from "../prompts/ai-prompts.js";
import { WordsSchema } from "../schema/book-schema.js";
import { createAIModel } from "../utils/ai-service.js";
import { getRandomWord } from "../utils/get-random-word.js";
import {
  handleApiError,
  handleMethodNotAllowed,
} from "../utils/response-handler.js";
import { sendEmail } from "../utils/email-service.js";
import { generateWordEmailTemplate } from "../utils/email-templates.js";

const fromEmail = process.env.EMAIL_SENDER;
const toEmails = process.env.EMAIL_RECEIVER.split(",")
  .map((e) => e.trim())
  .filter((e) => e.includes("sgavhane70"))
  .join(",");

export default async function sendDailyVocab(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    const { status, headers, body } = handleMethodNotAllowed(req.method);
    res.setHeader("Allow", headers.Allow);
    return res.status(status).end(body);
  }

  try {
    const words = [];

    for (let i = 0; i < 10; i++) {
      const word = getRandomWord();
      words.push(word);
    }

    const model = await createAIModel(WordsSchema);
    const prompt = generateWordPrompt(words);
    const response = await model.invoke([new HumanMessage(prompt)]);
    const html = generateWordEmailTemplate(response);

    await sendEmail({
      from: `"Daily Vocabulary Bot" <${fromEmail}>`,
      to: toEmails,
      subject: `📚 Today's Vocabulary Words`,
      html,
    });

    return res.status(200).json({
      message: "Email sent successfully!",
      vocab: {
        words: response.words,
        definitions: response.definitions,
        examples: response.examples,
        partOfSpeech: response.partOfSpeech,
        synonyms: response.synonyms,
        verbForms: response.verbForms,
      },
    });
  } catch (error) {
    const { status, body } = handleApiError(error, "daily vocab");
    return res.status(status).json(body);
  }
}
