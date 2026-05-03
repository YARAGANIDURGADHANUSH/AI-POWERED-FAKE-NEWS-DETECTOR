import requests
from dotenv import load_dotenv
import os

load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

if not SERPER_API_KEY:
    raise ValueError("SERPER_API_KEY not found")


def build_query(text):
    # ✅ Use first meaningful sentence, not just first line
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 20]
    if sentences:
        return f"{sentences[0]} fact check"
    return f"{text[:120].strip()} fact check"


def search_serper(query):
    url = "https://google.serper.dev/search"

    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "q": query,
        "num": 5
    }

    try:
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            print(f"⚠️ Serper API error: {response.status_code}")
            return []

        data = response.json()
        results = []

        for item in data.get("organic", []):
            link = item.get("link", "")

            # ✅ Skip social media & video platforms
            if any(x in link for x in ["facebook", "twitter", "x.com", "instagram", "youtube", "tiktok", "reddit"]):
                continue

            if link:
                results.append({
                    "title": item.get("title", ""),
                    "url": link,
                    "snippet": item.get("snippet", "")  # ✅ keep snippet for fallback context
                })

        return results

    except Exception as e:
        print(f"❌ Serper search error: {e}")
        return []


def verify_with_web(news_text):
    try:
        query = build_query(news_text)
        print(f"🔍 Search query: {query}")

        results = search_serper(query)
        sources = [r["url"] for r in results]

        return {
            "query_used": query,
            "sources": sources,
            "web_evidence_found": len(sources) > 0,
            "snippets": {r["url"]: r["snippet"] for r in results}  # ✅ snippets for richer context
        }

    except Exception as e:
        print(f"❌ verify_with_web error: {e}")
        return {
            "query_used": "",
            "sources": [],
            "web_evidence_found": False,
            "snippets": {}
        }