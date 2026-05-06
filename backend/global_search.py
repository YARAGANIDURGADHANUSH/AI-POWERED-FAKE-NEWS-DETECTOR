import requests
import os
from dotenv import load_dotenv

load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

def is_valid_url(url: str) -> bool:
    if not url: return False
    blocked = ["facebook", "twitter", "x.com", "instagram", "youtube", "tiktok", "reddit", "pinterest"]
    return not any(b in url.lower() for b in blocked)

def search_global_web(query: str):
    if not SERPER_API_KEY:
        print("⚠️ SERPER_API_KEY missing")
        return []

    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    payload = {"q": f"{query} fact check news", "num": 8}

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code != 200: return []
        
        results = []
        for item in response.json().get("organic", []):
            link = item.get("link", "")
            if is_valid_url(link):
                results.append({
                    "title": item.get("title", ""), 
                    "url": link, 
                    "snippet": item.get("snippet", "")
                })
        return results
    except Exception as e:
        print(f"❌ Global Search Error: {e}")
        return []
