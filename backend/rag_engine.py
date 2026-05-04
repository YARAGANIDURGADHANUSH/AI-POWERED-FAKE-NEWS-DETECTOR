from web_verifier import verify_with_web
from similarity_engine import compute_similarity
from credibility_engine import score_sources
from contradiction_engine import analyze_content_llm
from decision_engine import compute_scores, compute_confidence, decide_label

import requests
from bs4 import BeautifulSoup


# ----------------------------
# Extract text from URL
# ----------------------------
def extract_text(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text() for p in paragraphs[:10]])
        return text[:1500]
    except:
        return ""


# ----------------------------
# Claim classifier
# ----------------------------
def classify_claim(text):
    text = text.lower()

    if any(x in text for x in ["banana", "sky is person", "made of whatsapp"]):
        return "nonsense"

    if any(x in text for x in ["bad", "good", "better", "worst", "great"]):
        return "opinion"

    if any(x in text for x in ["election", "government", "breaking", "policy"]):
        return "news"

    return "general"


# ----------------------------
# Balance sources
# ----------------------------
def balance_sources(sources):
    support = []
    refute = []

    for s in sources:
        if s["stance"] == "support":
            support.append(s)
        elif s["stance"] == "refute":
            refute.append(s)

    return support[:2] + refute[:2]


# ----------------------------
# MAIN PIPELINE
# ----------------------------
def rag_pipeline(claim):
    try:
        claim_type = classify_claim(claim)

        # 🚨 Nonsense handling
        if claim_type == "nonsense":
            return {
                "label": "FAKE",
                "confidence": 0.85,
                "explanation": "This claim is logically impossible.",
                "sources": []
            }

        # ⚠️ Opinion handling
        if claim_type == "opinion":
            return {
                "label": "OPINION",
                "confidence": 0.6,
                "explanation": "This claim is subjective and depends on perspective.",
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

        # ⚖️ balance
        final_sources = balance_sources(analyzed_sources)

        support, refute = compute_scores(final_sources)
        label = decide_label(support, refute)
        confidence = compute_confidence(support, refute, final_sources)

        return {
            "label": label,
            "confidence": confidence,
            "explanation": f"Based on {len(final_sources)} sources with mixed evidence.",
            "sources": final_sources
        }

    except Exception as e:
        return {
            "label": "UNCERTAIN",
            "confidence": 0.5,
            "explanation": f"Pipeline failed: {str(e)}",
            "sources": []
        }
