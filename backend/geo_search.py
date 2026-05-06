import requests
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
client = Groq(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None

def get_dynamic_local_domains(country: str, region: str):
    """The AI Domain Scout"""
    if not client: return []
    prompt = f"List the top 4 local/regional news website domains strictly for {region}, {country}. Return ONLY a raw comma-separated list. Example: eenadu.net, sakshi.com"
    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        raw = res.choices[0].message.content
        domains = [d.strip().lower() for d in raw.split(",") if "." in d]
        print(f"🤖 Scout found local domains: {domains}")
        return domains
    except Exception:
        return []

def is_valid_url(url: str) -> bool:
    blocked = ["facebook", "twitter", "x.com", "instagram", "youtube"]
    return not any(b in url.lower() for b in blocked) if url else False

def search_geo_web(query: str, region: str, country: str):
    """Geofenced regional search"""
    if not SERPER_API_KEY: return []

    allowed_domains = get_dynamic_local_domains(country, region)
    
    if allowed_domains:
        site_query = " OR ".join([f"site:{d}" for d in allowed_domains])
        search_query = f"{query} {region} ({site_query})"
    else:
        search_query = f"{query} {region} local news"

    print(f"🌍 STRICT GEO-SEARCH: {search_query}")

    url = "https://google.serper.dev/search"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    payload = {
        "q": search_query, 
        "num": 6,
        "location": f"{region}, {country}" # Google location targeting
    }

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
        print(f"❌ Geo Search Error: {e}")
        return []
