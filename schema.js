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
