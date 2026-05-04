import math

HIGH_AUTHORITY = [
    "who.int", "cdc.gov", "nih.gov",
    "mayoclinic.org", "nhs.uk"
]


def boost_authority(source):
    domain = source.get("domain", "")

    if any(h in domain for h in HIGH_AUTHORITY):
        return 1.15  # boost

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
        return 0.5

    diff = abs(support - refute)

    base = 0.55 + (diff / (total + 1e-6)) * 0.35

    # more sources → slightly higher confidence
    bonus = min(0.05, total_sources * 0.01)

    confidence = base + bonus

    return round(min(confidence, 0.92), 2)


def decide_label(support, refute):
    if support == 0 and refute == 0:
        return "UNCERTAIN"

    if refute > support * 1.2:
        return "FAKE"

    if support > refute * 1.2:
        return "REAL"

    return "PARTIALLY TRUE"


def generate_explanation(label, support_sources, refute_sources):
    if label == "FAKE":
        return "Multiple credible sources refute this claim and no strong supporting evidence was found."

    if label == "REAL":
        return "Multiple credible sources support this claim with no strong contradictions."

    if label == "PARTIALLY TRUE":
        return "Some sources support the claim while others contradict it, indicating mixed evidence."

    return "Insufficient reliable evidence found."
