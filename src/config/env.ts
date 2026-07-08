export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI ?? "",
  claudeApiKey: process.env.CLAUDE_API_KEY ?? "",
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID ?? "",
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
  linkedinRedirectUri: process.env.LINKEDIN_REDIRECT_URI ?? "",
  searchApiKey: process.env.SEARCH_API_KEY ?? "",
  imageApiKey: process.env.IMAGE_API_KEY ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
};
