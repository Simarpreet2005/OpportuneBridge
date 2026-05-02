import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"];

const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return apiKey;
};

const getModelCandidates = (preferredModel) => {
  const configuredModels = (process.env.GEMINI_MODELS || "")
    .split(",")
    .map(model => model.trim())
    .filter(Boolean);

  return [...new Set([
    preferredModel || process.env.GEMINI_MODEL,
    ...configuredModels,
    ...DEFAULT_MODELS
  ].filter(Boolean))];
};

const isRetryableGeminiError = (error) => {
  const status = Number(error?.status);
  const message = error?.message || "";

  return [429, 500, 502, 503, 504].includes(status)
    || /fetch failed|too many requests|service unavailable|high demand|overloaded/i.test(message);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createModel = (modelName, options = {}) => {
  const genAI = new GoogleGenerativeAI(getApiKey());

  return genAI.getGenerativeModel({
    model: modelName,
    ...(options.generationConfig ? { generationConfig: options.generationConfig } : {})
  });
};

export const getGeminiModel = (options = {}) => {
  return createModel(getModelCandidates(options.model)[0], options);
};

export const generateGeminiText = async (prompt, options = {}) => {
  const candidates = getModelCandidates(options.model);
  const retries = options.retries ?? 1;
  let lastError;

  for (const modelName of candidates) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const result = await createModel(modelName, options).generateContent(prompt);
        return result.response.text();
      } catch (error) {
        lastError = error;

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        if (attempt < retries) {
          await sleep(500 * (attempt + 1));
        }
      }
    }
  }

  throw lastError;
};

export const sendGeminiChat = async ({ message, history = [], options = {} }) => {
  const candidates = getModelCandidates(options.model);
  let lastError;

  for (const modelName of candidates) {
    try {
      const chat = createModel(modelName, options).startChat({ history });
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const parseGeminiJson = (text, type = "object") => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const pattern = type === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = cleaned.match(pattern);

  if (!match) {
    throw new Error(`No JSON ${type} found in Gemini response`);
  }

  return JSON.parse(match[0]);
};
