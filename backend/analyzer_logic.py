from geo_search import search_geo_web
from analysis_engine import analyze_claim
from scoring_engine import calculate_score

def run_geo_analyzer(claim: str, region: str, country: str = "India"):
    print(f"📍 [GEO ANALYSIS] Processing Regional Claim for {region}...")
    
    # 1. Strict Geofenced Web Search (Bypasses topic classification)
    print(f"🌐 Initiating Regional Search for {region}...")
    search_results = search_geo_web(claim, region, country)

    if not search_results:
        return {
            "label": "UNVERIFIED", 
            "confidence": 0, 
            "explanation": f"No credible local sources found in {region}.", 
            "region": region,
            "sources": []
        }

    # 2. LLM Analysis
    analysis_results = analyze_claim(claim, search_results)

    # 3. Calculate Score (Regional Mode - no penalty for small local sites)
    final_score = calculate_score(analysis_results, search_results, mode="regional")

    return {
        "label": final_score["label"],
        "confidence": final_score["confidence"],
        "explanation": analysis_results["explanation"],
        "region": region,
        "sources": search_results[:3]
    }
