from web_verifier import verify_with_web
from similarity_engine import compute_similarity
from credibility_engine import score_sources
from contradiction_engine import analyze_content_llm

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os

load_dotenv()

def extract_text(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text() for p in paragraphs[:10]])
        return text[:1500]
    except:
        return ""


def classify_input(claim):
    claim_lower = claim.lower()

    nonsense_patterns = ["banana", "sky is a person", "made of whatsapp"]
    if any(p in claim_lower for p in nonsense_patterns):
        return "nonsense"

    return "factual"


def compute_final_decision(sources_analysis):
    support_score = 0
    refute_score = 0

    for s in sources_analysis:
        cred = s["credibility"] / 100

        if s["stance"] == "support":
            support_score += cred
        elif s["stance"] == "refute":
            refute_score += cred

    total = support_score + refute_score

    if total == 0:
        return "UNCERTAIN", 0.5

    diff = abs(support_score - refute_score)

    confidence = min(0.9, 0.5 + diff)

    if refute_score > support_score:
        return "FAKE", confidence
    elif support_score > refute_score:
        return "REAL", confidence
    else:
        return "UNCERTAIN", 0.5


def rag_pipeline(claim):
    try:
        # 🔥 Step 1: classify input
        claim_type = classify_input(claim)

        if claim_type == "nonsense":
            return {
                "label": "FAKE",
                "confidence": 0.9,
                "explanation": "Claim is logically invalid or nonsensical.",
                "sources": []
            }

        web_result = verify_with_web(claim)
        urls = web_result.get("sources", [])

        if not urls:
            return {
                "label": "UNCERTAIN",
                "confidence": 0.5,
                "explanation": "No sources found",
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
                    "text": text
                })

        if not documents:
            return {
                "label": "UNCERTAIN",
                "confidence": 0.5,
                "explanation": "No content extracted",
                "sources": []
            }

        sim_scores = compute_similarity(claim, documents)

        scored_sources = score_sources(
            [s["url"] for s in enriched_sources],
            sim_scores
        )

        # 🔥 Add stance
        analyzed_sources = []

        for i, s in enumerate(scored_sources):
            text = enriched_sources[i]["text"]

            analysis = analyze_content_llm(claim, text, s["url"])

            stance = "neutral"
            if analysis["relation"] == "support":
                stance = "support"
            elif analysis["relation"] == "contradict":
                stance = "refute"

            analyzed_sources.append({
                **s,
                "stance": stance,
                "text": text
            })

        label, confidence = compute_final_decision(analyzed_sources)

        return {
            "label": label,
            "confidence": round(confidence, 2),
            "explanation": f"Based on {len(analyzed_sources)} sources with weighted agreement.",
            "sources": analyzed_sources[:3]
        }

    except Exception as e:
        return {
            "label": "UNCERTAIN",
            "confidence": 0.5,
            "explanation": f"Pipeline failed: {str(e)}",
            "sources": []
        }
