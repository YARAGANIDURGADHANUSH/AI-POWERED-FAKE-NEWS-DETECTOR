from urllib.parse import urlparse

TRUSTED_SOURCES = {
    # International
    "bbc.com": 0.9,
    "reuters.com": 0.95,
    "apnews.com": 0.95,
    "nytimes.com": 0.9,
    "theguardian.com": 0.85,
    "economictimes.com": 0.7,
    "pbs.org": 0.85,
    "cnn.com": 0.75,
    "washingtonpost.com": 0.85,
    "forbes.com": 0.75,
    "bloomberg.com": 0.85,
    "aljazeera.com": 0.8,
    # Indian
    "indianexpress.com": 0.85,
    "thehindu.com": 0.88,
    "ndtv.com": 0.75,
    "hindustantimes.com": 0.75,
    "timesofindia.com": 0.75,
    "livemint.com": 0.8,
    "business-standard.com": 0.8,
    "pib.gov.in": 0.95,
    "scroll.in": 0.75,
    "thequint.com": 0.72,
    "news18.com": 0.7,
    "theprint.in": 0.78,
    "deccanherald.com": 0.75,
    "tribuneindia.com": 0.72,
    "zeenews.india.com": 0.65,
}


def get_domain(url):
    return urlparse(url).netloc.replace("www.", "").replace("m.", "")


def clamp(value, min_val=0, max_val=1):
    return max(min_val, min(value, max_val))


def smart_domain_score(domain):
    # 1️⃣ Check manual trusted list first (highest priority)
    if domain in TRUSTED_SOURCES:
        return TRUSTED_SOURCES[domain]

    score = 0.5  # default for unknown domains

    # 2️⃣ TLD-based scoring
    if domain.endswith((".gov", ".gov.in", ".nic.in")):
        score = 0.95
    elif domain.endswith(".edu") or domain.endswith(".ac.in"):
        score = 0.85
    elif domain.endswith(".org"):
        score = 0.72

    # 3️⃣ Trusted keyword signals in domain name
    trusted_keywords = [
        "express", "hindu", "times", "reuters", "herald",
        "tribune", "post", "wire", "mint", "standard",
        "news", "press", "journal", "chronicle", "today"
    ]
    spam_keywords = [
        "viral", "buzz", "shocking", "exposed", "alert",
        "breaking99", "newsflash", "rumor", "rumour",
        "truths", "conspirac", "hiddennews", "realtruth"
    ]

    if any(kw in domain for kw in trusted_keywords):
        score = max(score, 0.68)

    if any(kw in domain for kw in spam_keywords):
        score = min(score, 0.25)

    # 4️⃣ Social media penalty
    if any(x in domain for x in ["facebook", "twitter", "x.com", "instagram", "tiktok", "youtube"]):
        score = 0.15

    return clamp(score, 0, 1)


def score_sources(urls, similarity_scores):
    results = []

    for i, url in enumerate(urls):
        domain = get_domain(url)

        sim = similarity_scores[i] if i < len(similarity_scores) else 0.3
        sim = clamp(sim, 0, 1)

        # ✅ Use smart scoring instead of manual dict lookup
        domain_score = smart_domain_score(domain)

        # Dynamic boost based on similarity
        if sim > 0.8:
            boost = 0.1
        elif sim < 0.3:
            boost = -0.1
        else:
            boost = 0

        adjusted_domain = clamp(domain_score + boost, 0, 1)

        # Final credibility (0–100 scale)
        credibility = (adjusted_domain * 0.6 + sim * 0.4)
        credibility = round(clamp(credibility, 0, 1) * 100, 2)

        results.append({
            "url": url,
            "domain": domain,
            "similarity": round(sim, 3),
            "credibility": credibility
        })

    return results