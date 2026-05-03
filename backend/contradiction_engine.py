def detect_contradictions(claim, sources):
    contradictions = []
    claim_lower = claim.lower()

    CONTRADICTION_PHRASES = [
        "no evidence", "no proof", "not confirmed", "false", "fake",
        "unverified", "debunked", "misleading", "disputed", "no record",
        "not true", "incorrect", "inaccurate", "hoax", "rumor", "rumour",
        "clarification", "correction issued", "fact check"  # ✅ added
    ]

    for s in sources:
        text = s.get("text", "").lower()
        url = s.get("url", "")
        found = []

        for phrase in CONTRADICTION_PHRASES:
            if phrase in text:
                found.append(phrase)

        if found:
            contradictions.append(f"{url} → contains: {', '.join(found[:3])}")

    return contradictions