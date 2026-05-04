from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None


# 🔹 Known fact-check domains
FACT_CHECK_DOMAINS = [
    "thequint.com", "altnews.in", "factcheck.afp.com",
    "boomlive.in", "snopes.com", "factcheck.org",
    "vishvasnews.com", "newschecker.in", "logically.ai",
    "ndtv.com"
]


# 🔹 Detect if URL is fact-check type
def is_fact_check_url(url: str) -> bool:
    url_lower = url.lower()

    if any(domain in url_lower for domain in FACT_CHECK_DOMAINS):
        return True

    if any(keyword in url_lower for keyword in [
        "fact-check", "factcheck", "debunk",
        "fake-news", "misinformation", "hoax"
    ]):
        return True

    return False


# 🔹 LLM-based stance detection
def analyze_content_llm(claim, article_text, url):
    if not client:
        return {
            "relation": "irrelevant",
            "reasoning": "No LLM available"
        }

    is_fc = is_fact_check_url(url)

    prompt = f"""
You are a fact-checking assistant.

Claim:
"{claim}"

Article:
"{article_text[:800]}"

Source URL: {url}
Fact-check site: {is_fc}

TASK:
Determine the relationship between article and claim.

Rules:
- If article confirms the claim → "support"
- If article says claim is false → "contradict"
- If article is about something else → "irrelevant"
- If fact-check article debunks the claim → "contradict"
- If fact-check article debunks misinformation ABOUT subject but supports real fact → "support"

Return ONLY JSON:

{{
  "relation": "support or contradict or irrelevant",
  "reasoning": "short explanation"
}}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            timeout=20
        )

        raw = response.choices[0].message.content.strip()

        match = re.search(r"\{.*\}", raw, re.DOTALL)

        if match:
            parsed = json.loads(match.group())

            relation = parsed.get("relation", "irrelevant")

            # 🔥 STRICT VALIDATION
            if relation not in ["support", "contradict", "irrelevant"]:
                relation = "irrelevant"

            return {
                "relation": relation,
                "reasoning": parsed.get("reasoning", "")
            }

    except Exception as e:
        print("⚠️ LLM CONTRADICTION ERROR:", e)

    return {
        "relation": "irrelevant",
        "reasoning": "Analysis failed"
    }


# 🔹 Optional helper (if you still want contradiction list)
def detect_contradictions(claim, sources):
    contradictions = []

    for s in sources:
        text = s.get("text", "")
        url = s.get("url", "")

        if not text or not url:
            continue

        analysis = analyze_content_llm(claim, text, url)

        if analysis["relation"] == "contradict":
            contradictions.append({
                "url": url,
                "reason": analysis["reasoning"]
            })

    return contradictions
