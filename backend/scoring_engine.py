from source_config import TRUSTED_SOURCES, LOW_TRUST_SOURCES

def calculate_score(analysis_results, search_results, mode="global"):
    """
    Calculates the final confidence score and label.
    mode: "global" or "regional"
    """
    base_confidence = analysis_results.get("confidence", 0)
    
    # Calculate credibility multiplier based on sources
    credibility_multiplier = 1.0
    trusted_count = 0
    low_trust_count = 0

    for source in search_results:
        url = source.get("url", "").lower()
        if any(domain in url for domain in TRUSTED_SOURCES):
            trusted_count += 1
        if any(domain in url for domain in LOW_TRUST_SOURCES):
            low_trust_count += 1

    if mode == "global":
        # Global rules: heavy penalty for low trust, bonus for high trust
        if trusted_count > 0:
            credibility_multiplier += 0.2 * trusted_count
        if low_trust_count > 0:
            credibility_multiplier -= 0.3 * low_trust_count
    elif mode == "regional":
        # Regional rules: Local papers are rarely in TRUSTED_SOURCES. 
        # We assume neutral credibility unless explicitly in LOW_TRUST_SOURCES.
        if low_trust_count > 0:
            credibility_multiplier -= 0.3 * low_trust_count

    # Apply limits
    credibility_multiplier = max(0.5, min(credibility_multiplier, 1.5))
    
    # Final Math
    final_confidence = min(100, int(base_confidence * credibility_multiplier))
    
    # Determine Label
    if final_confidence >= 75:
        label = "REAL"
    elif final_confidence <= 40:
        label = "FAKE"
    else:
        label = "UNVERIFIED"

    return {
        "label": label,
        "confidence": final_confidence
    }
