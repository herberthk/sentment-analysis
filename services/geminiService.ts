import { GoogleGenAI, Type } from "@google/genai";
import {
  AnalysisResult,
  ReviewData,
  ActionableItem,
  WordFrequency,
} from "../types";

// Lazy initialization to avoid top-level side effects during module load
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }
  return aiClient;
};

// Define schemas using the Type enum
// Note: We use 'any' for the schema type here to avoid importing 'Schema' which might cause runtime issues if not exported as value
const reviewSchema = {
  type: Type.OBJECT,
  properties: {
    date: {
      type: Type.STRING,
      description: "ISO 8601 date string (YYYY-MM-DD)",
    },
    sentiment: {
      type: Type.NUMBER,
      description: "Sentiment score from 0 (negative) to 100 (positive)",
    },
    snippet: {
      type: Type.STRING,
      description: "A short, representative snippet of the review",
    },
  },
  required: ["date", "sentiment", "snippet"],
};

const actionableItemSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
  },
  required: ["title", "description", "priority"],
};

const wordFrequencySchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    value: { type: Type.NUMBER },
    sentiment: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
  },
  required: ["text", "value", "sentiment"],
};

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    reviews: {
      type: Type.ARRAY,
      items: reviewSchema,
    },
    summary: {
      type: Type.ARRAY,
      items: actionableItemSchema,
    },
    wordCloud: {
      type: Type.ARRAY,
      items: wordFrequencySchema,
    },
    overallSentiment: { type: Type.NUMBER },
    totalReviews: { type: Type.NUMBER },
  },
  required: [
    "reviews",
    "summary",
    "wordCloud",
    "overallSentiment",
    "totalReviews",
  ],
};

export const analyzeReviews = async (
  rawText: string
): Promise<AnalysisResult> => {
  // Use Gemini 3 Pro with Thinking for deep analysis of unstructured data
  const model = "gemini-2.5-flash-preview-09-2025";
  const ai = getAiClient();

  const prompt = `
    You are an expert Data Analyst and Customer Experience Strategist.
    Analyze the following raw customer reviews. 
    
    1. Parse the reviews to identify individual entries. If dates are not explicitly present, infer a logical chronological sequence over the last 90 days to simulate a trend.
    2. Score the sentiment of each review from 0 (very negative) to 100 (very positive).
    3. Identify the top 3 critical areas for improvement (Actionable Items).
    4. Extract key recurring words or phrases (nouns/adjectives) for a word cloud, classifying them by sentiment.
    5. Calculate the overall average sentiment.
    
    Raw Reviews Data:
    ${rawText.slice(
      0,
      100000
    )} // Limit input to avoid token limits if extremely large, though Pro handles large context.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
        thinkingConfig: {
          thinkingBudget: 24576, // Max thinking budget for deep analysis
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const streamChatResponse = async function* (
  history: { role: string; content: string }[],
  contextData: AnalysisResult | null
) {
  const model = "gemini-2.5-flash-preview-09-2025";
  const ai = getAiClient();

  // Prepare system instruction with context
  let systemInstruction =
    "You are a helpful assistant for the Sentilens Dashboard. You help users understand their customer reviews.";

  if (contextData) {
    systemInstruction += `
      Current Dashboard Context:
      - Overall Sentiment: ${contextData.overallSentiment}/100
      - Total Reviews: ${contextData.totalReviews}
      - Top Complaints/Praises: ${contextData.wordCloud
        .map((w) => w.text)
        .join(", ")}
      - Key Action Items: ${contextData.summary.map((s) => s.title).join(", ")}
      
      When answering, refer to specific insights from this data. Use the Thinking capability to reason through complex questions about trends or root causes if asked.
    `;
  }

  // The last message in history is the one we want to send now.
  // We must exclude it from the history passed to chats.create.
  const lastMessage = history[history.length - 1].content;
  const previousHistory = history.slice(0, -1);

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
      thinkingConfig: {
        thinkingBudget: 24576,
      },
    },
    history: previousHistory.map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    })),
  });

  const result = await chat.sendMessageStream({
    message: lastMessage,
  });

  for await (const chunk of result) {
    yield chunk.text;
  }
};
