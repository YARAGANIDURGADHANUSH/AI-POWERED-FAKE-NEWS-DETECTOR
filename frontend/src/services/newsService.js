import { apiRequest } from "./api";

// Verify global news/fact
export const verifyNews = (news) =>
  apiRequest("/verify", {
    text: news
  });

// Verify region-specific news/fact
export const geoVerify = (news, region) =>
  apiRequest("/geo-verify", {
    text: news,
    country: "india",
    region
  });
