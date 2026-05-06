from global_search import search_global_web
from claim_classifier import classify_claim
from analysis_engine import analyze_claim
from scoring_engine import calculate_score

def run_global_detector(claim: str):
    print("🛡️ [FACT DETECTOR] Processing Global Claim...")
    
    # 1. Topic Classification
    topic = classify_claim(claim)
    print(f"🚥 Topic Classified As: {topic}")

    # 2. Early Bypasses
    if topic == "UNIVERSAL_TRUTH":
        return {"label": "REAL", "confidence": 99, "explanation": "This is an established universal fact.", "topic": topic, "sources": []}
    if topic == "NONSENSE_SATIRE":
        return {"label": "FAKE", "confidence": 95, "explanation": "This claim is logically impossible or satire.", "topic": topic, "sources": []}
    if topic == "OPINION_SUBJECTIVE":
        return {"label": "OPINION", "confidence": 80, "explanation": "Subjective statements cannot be fact-checked.", "topic": topic, "sources": []}

    # 3. Open Web Search
    print("🌐 Initiating Open Web Search...")
    search_results = search_global_web(claim)

    if not search_results:
        return {"label": "UNVERIFIED", "confidence": 0, "explanation": "No credible global sources found.", "topic": topic, "sources": []}

    # 4. LLM Analysis
    analysis_results = analyze_claim(claim, search_results)

    # 5. Calculate Score (Global Mode)
    final_score = calculate_score(analysis_results, search_results, mode="global")

    return {
        "label": final_score["label"],
        "confidence": final_score["confidence"],
        "explanation": analysis_results["explanation"],
        "topic": topic,
        "sources": search_results[:3]
    }
