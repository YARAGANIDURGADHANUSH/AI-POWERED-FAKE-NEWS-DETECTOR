from backend.predictor import predict_news
from backend.web_verifier import search_news

def hybrid_predict(text: str):
    # Step 1: ML prediction
    ml_result = predict_news(text)

    # Step 2: Web search
    search_results = search_news(text)

    # Step 3: Simple decision logic
    evidence_found = len(search_results) > 2

    if evidence_found:
        final_prediction = "Real"
    else:
        final_prediction = ml_result["prediction"]

    return {
        "input": text,
        "ml_prediction": ml_result["prediction"],
        "ml_confidence": ml_result["confidence"],
        "web_evidence_found": evidence_found,
        "sources": search_results[:3],
        "final_prediction": final_prediction
    }