from web_verifier import verify_with_web
from similarity_engine import compute_similarity
from credibility_engine import score_sources
from contradiction_engine import analyze_content_llm
from decision_engine import (
    compute_scores,
    compute_confidence,
    decide_label,
    generate_explanation
)

import requests
from bs4 import BeautifulSoup


def extract_text(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text() for p in paragraphs[:10]])
        return text[:1500]
    except:
        return ""


def rag_pipeline(claim):
    try:
        web_result = verify_with_web(claim)
        urls = web_result.get("sources", [])

        if not urls:
            return {
                "label": "UNCERTAIN",
                "confidence": 0.4,
                "explanation": "No sources found.",
                "sources": [],
                "differences": []
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
                "confidence": 0.4,
                "explanation": "No usable content extracted.",
                "sources": [],
                "differences": []
            }

        sim_scores = compute_similarity(claim, documents)

        scored_sources = score_sources(
            [s["url"] for s in enriched_sources],
            sim_scores
        )

        # map url → text
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

        # 🔥 NEW DECISION ENGINE
        support, refute, support_sources, refute_sources = compute_scores(analyzed_sources)

        label = decide_label(support, refute)

        confidence = compute_confidence(
            support,
            refute,
            len(analyzed_sources)
        )

        explanation = generate_explanation(
            label,
            support_sources,
            refute_sources
        )

        return {
            "label": label,
            "confidence": confidence,
            "explanation": explanation,

            "differences": [
                f"{s['url']} → {s['stance']}"
                for s in analyzed_sources if s["stance"] == "refute"
            ],

            "sources": analyzed_sources[:3]
        }

    except Exception as e:
        return {
            "label": "UNCERTAIN",
            "confidence": 0.4,
            "explanation": f"Pipeline error: {str(e)}",
            "sources": [],
            "differences": []
        }
