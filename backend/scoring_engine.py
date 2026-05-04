from urllib.parse import urlparse
from source_config import TRUSTED_SOURCES, LOW_TRUST_SOURCES


def get_domain(url):
    return urlparse(url).netloc.replace("www.", "")


def bias_penalty(bias):
    if bias in ["left", "right"]:
        return 0.9
    return 1.0


def score_sources(urls, sim_scores):
    sources = []

    for i, url in enumerate(urls):
        base = int(sim_scores[i] * 100)
        domain = get_domain(url)

        if any(t in domain for t in TRUSTED_SOURCES):
            base += 25
        elif any(l in domain for l in LOW_TRUST_SOURCES):
            base -= 25

        base = max(20, min(base, 95))

        sources.append({
            "url": url,
            "credibility": base,
            "domain": domain
        })

    return sources


def compute_scores(sources):
    support = 0
    refute = 0

    for s in sources:
        cred = s["credibility"] / 100
        bias_factor = bias_penalty(s.get("bias", "unknown"))

        weight = cred * bias_factor

        if s["stance"] == "support":
            support += weight
        elif s["stance"] == "refute":
            refute += weight

    return support, refute


def compute_confidence(support, refute, sources):
    total = support + refute

    if total == 0:
        return 0.5

    diff = abs(support - refute)
    base = 0.55 + (diff / total) * 0.3

    avg_cred = sum(s["credibility"] for s in sources) / len(sources)
    confidence = base * (avg_cred / 100)

    return round(min(confidence, 0.85), 2)


def decide_label(support, refute):
    if support == 0 and refute == 0:
        return "UNCERTAIN"

    if support > 0 and refute > 0:
        return "PARTIALLY TRUE"

    if refute > 0:
        return "FAKE"

    return "REAL"
