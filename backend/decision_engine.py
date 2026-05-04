import math

HIGH_AUTHORITY = [
    "who.int", "cdc.gov", "nih.gov",
    "mayoclinic.org", "nhs.uk",
    "bbc.com", "reuters.com",
    "apnews.com", "nature.com",
    "gov.in", "edu"
]


def boost_authority(source):
    domain = source.get("domain", "")

    if any(h in domain for h in HIGH_AUTHORITY):
        return 1.3  # stronger boost

    return 1.0


def compute_scores(sources):
    support = 0
    refute = 0

    support_sources = []
    refute_sources = []

    for s in sources:
        cred = s["credibility"] / 100
        weight = cred * boost_authority(s)

        if s["stance"] == "support":
            support += weight
            support_sources.append(s)

        elif s["stance"] == "refute":
            refute += weight
            refute_sources.append(s)

    return support, refute, support_sources, refute_sources


def compute_confidence(support, refute, total_sources):
    total = support + refute

    if total == 0:
        return 0.4

    diff = abs(support - refute)

    # 🔥 dominance ratio
    dominance = diff / (total + 1e-6)

    # 🔥 base confidence
    confidence = 0.5 + (dominance * 0.35)

    # 🔥 disagreement penalty
    disagreement = min(support, refute)
    penalty = disagreement * 0.15

    confidence -= penalty

    # 🔥 small bonus for more sources
    bonus = min(0.05, total_sources * 0.01)
    confidence += bonus

    # ❗ strict cap
    confidence = max(0.4, min(confidence, 0.85))

    return round(confidence, 2)


def decide_label(support, refute):
    total = support + refute

    if total == 0:
        return "UNCERTAIN"

    ratio = abs(support - refute) / (total + 1e-6)

    # 🔥 stronger thresholds
    if refute > support and ratio > 0.3:
        return "FAKE"

    if support > refute and ratio > 0.3:
        return "REAL"

    return "PARTIALLY TRUE"


def generate_explanation(label, support_sources, refute_sources):
    if label == "FAKE":
        return "Multiple credible and authoritative sources refute this claim."

    if label == "REAL":
        return "Multiple credible and authoritative sources support this claim."

    if label == "PARTIALLY TRUE":
        return "Mixed evidence found — some sources support while others contradict."

    return "Insufficient reliable evidence found."
