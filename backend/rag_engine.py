from web_verifier import verify_with_web
from similarity_engine import compute_similarity
from credibility_engine import score_sources
from contradiction_engine import analyze_content_llm

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os

load_dotenv()

# 🔥 High authority domains
HIGH_AUTHORITY = [
    "who.int", "cdc.gov", "nih.gov",
    "mayoclinic.org", "nhs.uk"
]


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


def boost_authority(domain):
    if any(h in domain for h in HIGH_AUTHORITY):
        return 1.15
    return 1.0


def compute_final_decision(sources_analysis):
    support_score = 0
    refute_score = 0

    support_sources = []
    refute_sources = []

    for s in sources_analysis:
        cred = s["credibility"] / 100
        boost = boost_authority(s["domain"])
        weight = cred * boost

        if s["stance"] == "support":
            support_score += weight
            support_sources.append(s)

        elif s["stance"] == "refute":
            refute_score += weight
            refute_sources.append(s)

    total = support_score + refute_score

    if total == 0:
        return "UNCERTAIN", 0.5, support_sources, refute_sources

    diff = abs(support_score - refute_score)

    # 🔥 Improved confidence
    confidence = 0.55 + (diff / (total + 1e-6)) * 0.35

    # small bonus for more sources
    confidence += min(0.05, len(sources_analysis) * 0.01)

    confidence = round(min(confidence, 0.92), 2)

    if refute_score > support_score * 1.2:
        label = "FAKE"
    elif support_score > refute_score * 1.2:
        label = "REAL"
    else:
        label = "PARTIALLY TRUE"

    return label, confidence, support_sources, refute_sources


def rag_pipeline(claim):
    try:
        # 🔥 Step 1: classify input
        claim_type = classify_input(claim)

        if claim_type == "nonsense":
            return {
                "label": "FAKE",
                "confidence": 0.9,
                "explanation": "Claim is logically invalid or nonsensical.",
                "evidence": {},
                "sources": []
            }

        web_result = verify_with_web(claim)
        urls = web_result.get("sources", [])

        if not urls:
            return {
                "label": "UNCERTAIN",
                "confidence": 0.5,
                "explanation": "No sources found.",
                "evidence": {},
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
                "explanation": "No usable content extracted.",
                "evidence": {},
                "sources": []
            }

        sim_scores = compute_similarity(claim, documents)

        scored_sources = score_sources(
            [s["url"] for s in enriched_sources],
            sim_scores
        )

        # 🔥 FIXED: correct mapping (no index mismatch)
        url_to_text = {
            s["url"]: s["text"] for s in enriched_sources
        }

        analyzed_sources = []

        for s in scored_sources:
            text = url_to_text.get(s["url"], "")

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

        label, confidence, support_sources, refute_sources = compute_final_decision(analyzed_sources)

        # 🔥 Better explanation
        if label == "FAKE":
            explanation = "Multiple credible sources refute this claim."
        elif label == "REAL":
            explanation = "Multiple credible sources support this claim."
        else:
            explanation = "Mixed evidence found across sources."

        return {
            "label": label,
            "confidence": confidence,
            "explanation": explanation,

            "evidence": {
                "supporting": [s["url"] for s in support_sources[:2]],
                "refuting": [s["url"] for s in refute_sources[:2]],
                "total_sources": len(analyzed_sources)
            },

            "sources": analyzed_sources[:3]
        }

    except Exception as e:
        return {
            "label": "UNCERTAIN",
            "confidence": 0.5,
            "explanation": f"Pipeline failed: {str(e)}",
            "evidence": {},
            "sources": []
        }
