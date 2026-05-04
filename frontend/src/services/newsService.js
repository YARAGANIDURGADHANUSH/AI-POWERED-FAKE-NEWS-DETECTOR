import { apiRequest } from "./api";

export const verifyNews = (news) =>
  apiRequest("/verify", { news });

export const geoVerify = (news, region) =>
  apiRequest("/geo-verify", {
    news,
    country: "india",
    region
  });