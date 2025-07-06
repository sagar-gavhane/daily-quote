import { z } from "zod";

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

export const WordSchema = z.object({
  word: z.string().describe("The vocabulary word"),
  definition: z
    .string()
    .min(10, { message: "Definition must be at least 10 characters long." })
    .max(200, { message: "Definition must be 200 characters or less." })
    .describe("Definition of the vocabulary word"),
  examples: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Example sentences using the word"),
  partOfSpeech: z
    .string()
    .describe("Part of speech (noun, verb, adjective, etc.)"),
  synonyms: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("Synonyms for the vocabulary word"),
  verbForms: z
    .object({
      base: z.string().describe("Base form of the verb"),
      pastTense: z.string().describe("Past tense form of the verb"),
      pastParticiple: z.string().describe("Past participle form of the verb"),
    })
    .optional()
    .describe("Verb forms if the word is a verb"),
});

export const WordsSchema = z.array(WordSchema);
