from web_verifier import verify_with_web
from similarity_engine import compute_similarity
from credibility_engine import score_sources
from contradiction_engine import detect_contradictions

import requests
from bs4 import BeautifulSoup
from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

# 🔹 Load env
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ✅ SAFE INIT (NO CRASH)
if not GROQ_API_KEY:
    print("⚠️ GROQ_API_KEY missing — running in fallback mode")
    client = None
else:
    client = Groq(api_key=GROQ_API_KEY)


# 🔹 Extract content
def extract_text(url):
    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")

        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text() for p in paragraphs[:10]])

        return text[:1500]
    except Exception as e:
        print("❌ EXTRACT ERROR:", e)
        return ""


# 🔹 LLM Judge (SAFE)
def llm_judge(claim, ranked_sources):
    if client is None:
        print("⚠️ Skipping LLM (no API key)")
        return None

    context = ""

    for s in ranked_sources[:3]:
        context += f"\nSOURCE: {s['url']}\nCONTENT: {s.get('text','')[:600]}\n"

    prompt = f"""
You are a strict fact-checking AI.

Claim:
{claim}

Evidence:
{context}

Rules:
- Use ONLY labels: REAL, FAKE, PARTIALLY TRUE, UNCERTAIN
- Return ONLY valid JSON

Format:
{{
  "label": "REAL or FAKE or PARTIALLY TRUE or UNCERTAIN",
  "confidence": 0.0,
  "explanation": "short explanation"
}}
"""

    for _ in range(2):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
            )

            raw = response.choices[0].message.content.strip()
            match = re.search(r"\{.*\}", raw, re.DOTALL)

            if match:
                parsed = json.loads(match.group())

                valid = ["REAL", "FAKE", "PARTIALLY TRUE", "UNCERTAIN"]
                if parsed.get("label") in valid:
                    return parsed

        except Exception as e:
            print("⚠️ LLM error:", e)

    return None


# 🔹 MAIN PIPELINE
def rag_pipeline(claim):
    try:
        web_result = verify_with_web(claim)
        urls = web_result.get("sources", [])

        if not urls:
            return {
                "label": "UNCERTAIN",
                "confidence": 0.5,
                "explanation": "No sources found",
                "differences": [],
                "sources": []
            }

        documents = []
        enriched_sources = []

        for url in urls[:5]:
            text = extract_text(url)

            if text:
                documents.append(text)
                enriched_sources.append({
                    "url": url,
                    "text": text,
                    "snippet": text[:200]
                })

        if not documents:
            return {
                "label": "UNCERTAIN",
                "confidence": 0.5,
                "explanation": "No content extracted",
                "differences": [],
                "sources": []
            }

        sim_scores = compute_similarity(claim, documents)

        scored_sources = score_sources(
            [s["url"] for s in enriched_sources],
            sim_scores
        )

        for i, s in enumerate(scored_sources):
            s["text"] = enriched_sources[i]["text"]
            s["snippet"] = enriched_sources[i]["snippet"]

        ranked_sources = sorted(
            scored_sources,
            key=lambda x: x["credibility"],
            reverse=True
        )

        contradictions = detect_contradictions(claim, ranked_sources)

        result = llm_judge(claim, ranked_sources)

        # 🔥 FALLBACK LOGIC
        if not result:
            high_cred = [s for s in ranked_sources if s["credibility"] > 70]

            if len(high_cred) >= 2:
                return {
                    "label": "REAL",
                    "confidence": 0.7,
                    "explanation": "Multiple reliable sources support this.",
                    "differences": contradictions,
                    "sources": ranked_sources[:3]
                }

            return {
                "label": "UNCERTAIN",
                "confidence": 0.5,
                "explanation": "Insufficient evidence.",
                "differences": contradictions,
                "sources": ranked_sources[:3]
            }

        return {
            "label": result.get("label", "UNCERTAIN"),
            "confidence": round(result.get("confidence", 0.5), 2),
            "explanation": result.get("explanation", ""),
            "differences": contradictions,
            "sources": ranked_sources[:3]
        }

    except Exception as e:
        print("❌ PIPELINE ERROR:", e)
        return {
            "label": "UNCERTAIN",
            "confidence": 0.5,
            "explanation": "Pipeline failed",
            "differences": [],
            "sources": []
        }
