import requests
from dotenv import load_dotenv
import os

load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

def build_query(text):
    text = text.replace("\n", " ").strip()
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 20]
    if sentences:
        return f"{sentences[0]} fact check"
    return f"{text[:120]} fact check"

def is_valid_url(url: str) -> bool:
    if not url: return False
    blocked = ["facebook", "twitter", "x.com", "instagram", "youtube", "tiktok", "reddit", "pinterest"]
    if any(b in url.lower() for b in blocked): return False
    return True

def search_serper(query, allowed_domains=None, location=None):
    if not SERPER_API_KEY: 
        print("⚠️ SERPER_API_KEY missing — search disabled")
        return []

    # Apply strict geofencing if domains are provided
    if allowed_domains and len(allowed_domains) > 0:
        site_query = " OR ".join([f"site:{domain}" for domain in allowed_domains])
        query = f"{query} ({site_query})"
        print(f"🌍 STRICT GEO-SEARCH: {query}")

    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    
    payload = {"q": query, "num": 8}
    
    # Inject Google's native location parameter
    if location:
        payload["location"] = location 

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code != 200: return []
        
        results = []
        for item in response.json().get("organic", []):
            link = item.get("link", "")
            if is_valid_url(link):
                results.append({"title": item.get("title", ""), "url": link, "snippet": item.get("snippet", "")})
        return results
    except Exception as e:
        print("❌ SERPER ERROR:", e)
        return []

def verify_with_web(news_text, allowed_domains=None, location=None):
    try:
        query = build_query(news_text)
        results = search_serper(query, allowed_domains, location)

        seen = set()
        unique_sources = []
        for r in results:
            if r["url"] not in seen:
                seen.add(r["url"])
                unique_sources.append(r)

        return {
            "query_used": query,
            "sources": [r["url"] for r in unique_sources],
            "results": unique_sources,
            "web_evidence_found": len(unique_sources) > 0
        }
    except Exception as e:
        return {"query_used": "", "sources": [], "results": [], "web_evidence_found": False}
