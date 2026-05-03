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

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY missing")

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


# 🔹 LLM Judge (STABLE VERSION)
def llm_judge(claim, ranked_sources):
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
- No extra text

Format:
{{
  "label": "REAL or FAKE or PARTIALLY TRUE or UNCERTAIN",
  "confidence": 0.0,
  "explanation": "short explanation"
}}
"""

    for attempt in range(2):  # retry
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0,  # 🔥 FIXED (deterministic)
            )

            raw = response.choices[0].message.content.strip()
            print("🧠 RAW LLM:", raw)

            match = re.search(r"\{.*\}", raw, re.DOTALL)

            if match:
                parsed = json.loads(match.group())

                # 🔥 Validate label
                valid = ["REAL", "FAKE", "PARTIALLY TRUE", "UNCERTAIN"]
                if parsed.get("label") not in valid:
                    raise ValueError("Invalid label")

                return parsed

        except Exception as e:
            print("⚠️ LLM retry error:", e)

    return None  # fallback trigger


# 🔹 MAIN PIPELINE
def rag_pipeline(claim):
    try:
        # 🔹 Step 1: Web search
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

        # 🔹 Step 2: Extract content
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

        # 🔹 Step 3: Similarity
        sim_scores = compute_similarity(claim, documents)

        # 🔹 Step 4: Credibility scoring
        scored_sources = score_sources(
            [s["url"] for s in enriched_sources],
            sim_scores
        )

        # 🔹 Merge text
        for i, s in enumerate(scored_sources):
            s["text"] = enriched_sources[i]["text"]
            s["snippet"] = enriched_sources[i]["snippet"]

        # 🔹 Step 5: Rank
        ranked_sources = sorted(
            scored_sources,
            key=lambda x: x["credibility"],
            reverse=True
        )

        # 🔹 Step 6: Detect contradictions
        contradictions = detect_contradictions(claim, ranked_sources)

        # 🔹 Step 7: LLM decision
        result = llm_judge(claim, ranked_sources)

        # 🔥 Step 8: Fallback logic (if LLM fails)
        if not result or "label" not in result:
            print("⚠️ Using fallback logic")

            high_cred_sources = [
                s for s in ranked_sources if s["credibility"] > 70
            ]

            if any("no evidence" in s["text"].lower() for s in high_cred_sources):
                label = "FAKE"
                explanation = "Reliable sources report no evidence supporting the claim."
                confidence = 0.75

            elif len(high_cred_sources) >= 2:
                label = "REAL"
                explanation = "Multiple credible sources support the claim."
                confidence = 0.7

            else:
                label = "UNCERTAIN"
                explanation = "Insufficient reliable evidence."
                confidence = 0.5

            return {
                "label": label,
                "confidence": confidence,
                "explanation": explanation,
                "differences": contradictions,
                "sources": ranked_sources[:3]
            }

        # 🔹 Step 9: Hybrid logic (FIXED)
        final_label = result.get("label", "UNCERTAIN")
        confidence = result.get("confidence", 0.5)

        # 🔥 FIXED: progressive downgrade (NOT force FAKE)
        if contradictions:
            if final_label == "REAL":
                final_label = "PARTIALLY TRUE"
            elif final_label == "PARTIALLY TRUE":
                final_label = "FAKE"

            confidence = min(1.0, confidence + 0.1)

        # 🔹 Boost for strong sources
        if ranked_sources and ranked_sources[0]["credibility"] > 80:
            confidence += 0.1

        confidence = round(min(confidence, 1.0), 2)

        return {
            "label": final_label,
            "confidence": confidence,
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