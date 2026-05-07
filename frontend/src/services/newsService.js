import { apiRequest } from "./api";

// Global fact verification
export const verifyNews = (news) =>
  apiRequest("/verify", {
    claim: news
  });

// Regional / Geo verification
export const geoVerify = (news, region) =>
  apiRequest("/geo-verify", {
    claim: news,
    region,
    country: "India"
  });
