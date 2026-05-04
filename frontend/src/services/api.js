const BASE_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

export async function apiRequest(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return res.json();
}