from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None

FACT_CHECK_DOMAINS = [
    "thequint.com", "altnews.in", "factcheck.afp.com",
    "boomlive.in", "snopes.com", "factcheck.org",
    "vishvasnews.com", "newschecker.in", "logically.ai",
    "ndtv.com"
]

def is_fact_check_url(url):
    url_lower = url.lower()
    # ✅ Check URL path for fact-check keywords too
    if any(d in url_lower for d in FACT_CHECK_DOMAINS):
        return True
    if any(kw in url_lower for kw in [
        "fact-check", "factcheck", "fact_check",
        "fake-news", "fakenews", "debunk",
        "misinformation", "hall-of-fake"
    ]):
        return True
    return False


def analyze_content_llm(claim, article_text, url):
    """Use LLM to understand if article supports or contradicts claim"""
    if not client:
        return {"relation": "irrelevant", "reasoning": "No LLM available"}

    is_fc = is_fact_check_url(url)

    prompt = f"""
You are analyzing whether a web article supports or contradicts a claim.

Claim: "{claim}"
Source URL: {url}
Is fact-check site: {is_fc}

Article content:
{article_text[:800]}

IMPORTANT RULES:
- If this is a fact-check article debunking FAKE claims ABOUT the subject → "support"
- Example: Quint's "Hall of Fake News about Modi" → SUPPORTS that Modi is real PM
- If article directly says the claim itself is false → "contradict"
- If article confirms the claim → "support"
- If unrelated → "irrelevant"

Return ONLY valid JSON:
{{
  "relation": "support or contradict or irrelevant",
  "reasoning": "one sentence explanation"
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            timeout=15,
        )
        raw = response.choices[0].message.content.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print(f"⚠️ Contradiction LLM error: {e}")

    return {"relation": "irrelevant", "reasoning": "Analysis failed"}


def detect_contradictions(claim, sources):
    contradictions = []

    for s in sources:
        text = s.get("text", "")
        url = s.get("url", "")

        if not text or not url:
            continue

        analysis = analyze_content_llm(claim, text, url)

        # ✅ Only add if LLM explicitly says contradict
        if analysis.get("relation") == "contradict":
            contradictions.append(
                f"{url} → {analysis.get('reasoning', 'contradicts claim')}"
            )
        else:
            print(f"✅ Not a contradiction ({analysis.get('relation')}): {url}")

    return contradictions
