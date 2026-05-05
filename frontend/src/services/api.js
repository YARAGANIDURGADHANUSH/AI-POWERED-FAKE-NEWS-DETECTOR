const BASE_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

export async function apiRequest(endpoint, body, method = "POST") {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || data.detail || "Request failed");
  return data;
}

export async function apiGet(endpoint) {
  return apiRequest(endpoint, null, "GET");
}