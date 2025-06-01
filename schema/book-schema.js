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
