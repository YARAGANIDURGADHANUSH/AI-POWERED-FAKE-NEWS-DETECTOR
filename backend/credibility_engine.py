from urllib.parse import urlparse
from source_config import TRUSTED_SOURCES, LOW_TRUST_SOURCES


def get_domain(url):
    return urlparse(url).netloc.replace("www.", "")


def base_score_from_similarity(similarity):
    return int(similarity * 100)


def adjust_credibility(base_score, url):
    domain = get_domain(url)

    if any(t in domain for t in TRUSTED_SOURCES):
        return min(base_score + 25, 95)

    if any(l in domain for l in LOW_TRUST_SOURCES):
        return max(base_score - 25, 20)

    return base_score


def score_sources(urls, sim_scores):
    scored = []

    for i, url in enumerate(urls):
        base = base_score_from_similarity(sim_scores[i])
        final_score = adjust_credibility(base, url)

        scored.append({
            "url": url,
            "credibility": final_score,
            "domain": get_domain(url)
        })

    return scored
