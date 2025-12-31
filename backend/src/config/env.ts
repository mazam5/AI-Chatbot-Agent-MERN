export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  googleGenAIKey: process.env.GOOGLE_GENAI_API_KEY,
  maxMessageLength: 10000,
  maxHistoryMessages: 10, // Last N messages to include in context
  llmTimeout: 30000, // 30 seconds
} as const;
