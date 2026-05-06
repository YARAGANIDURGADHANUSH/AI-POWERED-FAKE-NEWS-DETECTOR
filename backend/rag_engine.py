from web_verifier import verify_with_web
from analysis_engine import compute_similarity, analyze_content_llm
from scoring_engine import score_sources, compute_scores, compute_confidence, decide_label
from geo_news_engine import verify_geo_news
from claim_classifier import classify_claim
from geo_store import update_state
import requests
from bs4 import BeautifulSoup

def extract_text(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        return " ".join([p.get_text() for p in soup.find_all("p")[:10]])
    except:
        return ""

def rag_pipeline(claim):
    print("🔥 PIPELINE RUNNING")
    claim_type = classify_claim(claim)

    if claim_type == "NONSENSE":
        return {"label": "FAKE", "confidence": 0.85, "explanation": "Logically impossible", "sources": []}
    if claim_type == "OPINION":
        return {"label": "OPINION", "confidence": 0.6, "explanation": "Subjective claim", "sources": []}

    web = verify_with_web(claim)
    urls = web["sources"][:5]
    documents, enriched = [], []

    for url in urls:
        text = extract_text(url)
        if text:
            documents.append(text)
            enriched.append({"url": url, "text": text})

    if not documents:
        return {"label": "UNCERTAIN", "confidence": 0.5, "explanation": "No data", "sources": []}

    sim_scores = compute_similarity(claim, documents)
    scored = score_sources([s["url"] for s in enriched], sim_scores)
    analyzed = []

    for i, s in enumerate(scored):
        relation = analyze_content_llm(claim, enriched[i]["text"], s["url"])["relation"]
        stance = "support" if relation == "support" else "refute" if relation == "contradict" else "neutral"
        analyzed.append({**s, "stance": stance})

    support, refute = compute_scores(analyzed)
    label = decide_label(support, refute)
    
    # ✅ BUG FIXED: Passing the list 'analyzed', not 'len(analyzed)'
    confidence = compute_confidence(support, refute, analyzed)

    return {
        "label": label,
        "confidence": confidence,
        "explanation": f"Based on {len(analyzed)} sources",
        "sources": analyzed[:3]
    }

def rag_pipeline_geo(claim, country, region):
    print("🌍 GEO PIPELINE")
    claim_type = classify_claim(claim)

    if claim_type == "NONSENSE":
        return {"label": "FAKE", "confidence": 0.85, "explanation": "Logically impossible", "regional_view": [], "sources": []}
    if claim_type == "OPINION":
        return {"label": "OPINION", "confidence": 0.6, "explanation": "Subjective claim.", "regional_view": [], "sources": []}

    geo_data = verify_geo_news(claim, country, region)
    urls = geo_data["sources"][:5]
    geo_sources = geo_data["geo_sources"]
    documents, enriched = [], []

    for url in urls:
        text = extract_text(url)
        if text:
            documents.append(text)
            enriched.append({"url": url, "text": text})

    if not documents:
        return {"label": "UNCERTAIN", "confidence": 0.5, "explanation": "No regional data", "regional_view": []}

    sim_scores = compute_similarity(claim, documents)
    scored = score_sources([s["url"] for s in enriched], sim_scores)
    analyzed = []

    for i, s in enumerate(scored):
        relation = analyze_content_llm(claim, enriched[i]["text"], s["url"])["relation"]
        stance = "support" if relation == "support" else "refute" if relation == "contradict" else "neutral"
        
        domain = s["domain"]
        bias = "unknown"
        for geo in geo_sources:
            if geo["domain"] in domain:
                bias = geo["bias"]

        analyzed.append({**s, "stance": stance, "bias": bias})

    support, refute = compute_scores(analyzed)
    label = decide_label(support, refute)
    
    # ✅ BUG FIXED: Passing the list 'analyzed'
    confidence = compute_confidence(support, refute, analyzed)

    update_state(region, label)

    regional_view = [{"name": src["name"], "bias": src["bias"], "note": "Represents regional narrative"} for src in geo_sources]

    return {
        "label": label,
        "confidence": confidence,
        "explanation": f"Regional analysis for {region}",
        "regional_view": regional_view,
        "sources": analyzed[:3]
    }
