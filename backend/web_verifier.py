import requests
from dotenv import load_dotenv
import os

load_dotenv()

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

# ✅ NO CRASH
if not SERPER_API_KEY:
    print("⚠️ SERPER_API_KEY missing — search disabled")


def build_query(text):
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 20]
    if sentences:
        return f"{sentences[0]} fact check"
    return f"{text[:120].strip()} fact check"


def search_serper(query):
    if not SERPER_API_KEY:
        return []

    url = "https://google.serper.dev/search"

    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {"q": query, "num": 5}

    try:
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            return []

        data = response.json()
        results = []

        for item in data.get("organic", []):
            link = item.get("link", "")

            if any(x in link for x in ["facebook", "twitter", "youtube", "instagram"]):
                continue

            if link:
                results.append({
                    "title": item.get("title", ""),
                    "url": link,
                    "snippet": item.get("snippet", "")
                })

        return results

    except Exception as e:
        print("❌ SERPER ERROR:", e)
        return []


def verify_with_web(news_text):
    try:
        query = build_query(news_text)
        results = search_serper(query)

        return {
            "query_used": query,
            "sources": [r["url"] for r in results],
            "web_evidence_found": len(results) > 0
        }

    except Exception as e:
        print("❌ VERIFY ERROR:", e)
        return {
            "query_used": "",
            "sources": [],
            "web_evidence_found": False
        }
