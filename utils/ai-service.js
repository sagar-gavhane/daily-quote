import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const createAIModel = (schema, options = {}) => {
  const defaultOptions = {
    model: "gemini-2.5-flash-preview-05-20",
    temperature: 0.7,
    topP: 0.8,
  };

  const modelOptions = { ...defaultOptions, ...options };

  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    ...modelOptions,
  }).withStructuredOutput(schema);
};
