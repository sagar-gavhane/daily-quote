export const generateQuotePrompt = (quote) => {
  return `
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
};

export const generateBookPrompt = (book) => {
  return `
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
};

export const generateWordPrompt = (words) => {
  return `
      Act as a vocabulary expert and generate detailed definitions for the following words:

      Words: ${words.join(", ")}

      For each word, provide:
      - The word itself
      - A clear, concise definition (10-200 chars)
      - Example sentences (1-3) demonstrating usage in context

      Ensure definitions are accurate, easy to understand, and suitable for learners.
      Return valid JSON with an array of objects, each containing "word", "definition", and "examples" fields.`.trim();
};
