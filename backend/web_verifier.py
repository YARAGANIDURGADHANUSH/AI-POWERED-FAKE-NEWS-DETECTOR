import requests
from dotenv import load_dotenv
import os

load_dotenv()

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

if not SERPER_API_KEY:
    print("⚠️ SERPER_API_KEY missing — search disabled")


# 🔹 Build better search query
def build_query(text):
    text = text.replace("\n", " ").strip()

    sentences = [
        s.strip() for s in text.split(".")
        if len(s.strip()) > 20
    ]

    if sentences:
        return f"{sentences[0]} fact check"

    return f"{text[:120]} fact check"


# 🔹 Filter junk URLs
def is_valid_url(url: str) -> bool:
    if not url:
        return False

    url_lower = url.lower()

    blocked = [
        "facebook", "twitter", "x.com", "instagram",
        "youtube", "tiktok", "reddit", "pinterest"
    ]

    if any(b in url_lower for b in blocked):
        return False

    return True


# 🔹 SERPER search
def search_serper(query):
    if not SERPER_API_KEY:
        return []

    url = "https://google.serper.dev/search"

    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "q": query,
        "num": 8   # increased from 5
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=10
        )

        if response.status_code != 200:
            print("❌ SERPER status:", response.status_code)
            return []

        data = response.json()

        results = []

        for item in data.get("organic", []):
            link = item.get("link", "")

            if not is_valid_url(link):
                continue

            results.append({
                "title": item.get("title", ""),
                "url": link,
                "snippet": item.get("snippet", "")
            })

        return results

    except Exception as e:
        print("❌ SERPER ERROR:", e)
        return []


# 🔹 Main verification function
def verify_with_web(news_text):
    try:
        query = build_query(news_text)
        results = search_serper(query)

        # 🔥 Remove duplicates
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
        print("❌ VERIFY ERROR:", e)

        return {
            "query_used": "",
            "sources": [],
            "results": [],
            "web_evidence_found": False
        }
