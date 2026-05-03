from urllib.parse import urlparse

TRUSTED_SOURCES = {
    "bbc.com": 0.92, "reuters.com": 0.95, "apnews.com": 0.95,
    "nytimes.com": 0.90, "theguardian.com": 0.87, "pbs.org": 0.85,
    "cnn.com": 0.75, "washingtonpost.com": 0.87, "bloomberg.com": 0.87,
    "aljazeera.com": 0.80, "indianexpress.com": 0.85, "thehindu.com": 0.88,
    "ndtv.com": 0.75, "hindustantimes.com": 0.75, "timesofindia.com": 0.75,
    "livemint.com": 0.80, "business-standard.com": 0.80, "pib.gov.in": 0.95,
    "scroll.in": 0.75, "thequint.com": 0.80, "theprint.in": 0.78,
    "boomlive.in": 0.85, "altnews.in": 0.85, "factcheck.afp.com": 0.90,
    "vishvasnews.com": 0.78, "newschecker.in": 0.78, "snopes.com": 0.88,
    "factcheck.org": 0.90, "politifact.com": 0.88,
}

SOURCE_TYPE_WEIGHT = {
    "fact_check": 1.0,
    "trusted_news": 0.8,
    "unknown": 0.5,
    "low_trust": 0.1,
}


def get_domain(url):
    return urlparse(url).netloc.replace("www.", "").replace("m.", "")


def clamp(value, min_val=0.0, max_val=1.0):
    return max(min_val, min(value, max_val))


def classify_source_type(domain):
    fact_check = ["thequint.com", "altnews.in", "factcheck.afp.com",
                  "boomlive.in", "snopes.com", "factcheck.org",
                  "vishvasnews.com", "newschecker.in", "politifact.com"]
    trusted = ["bbc.com", "reuters.com", "apnews.com", "thehindu.com",
               "indianexpress.com", "ndtv.com", "timesofindia.com",
               "theguardian.com", "washingtonpost.com", "nytimes.com"]
    low_trust = ["twitter.com", "x.com", "facebook.com",
                 "instagram.com", "tiktok.com", "reddit.com"]

    if any(d in domain for d in fact_check):
        return "fact_check"
    elif any(d in domain for d in trusted):
        return "trusted_news"
    elif any(d in domain for d in low_trust):
        return "low_trust"
    return "unknown"


def smart_domain_score(domain):
    if domain in TRUSTED_SOURCES:
        return TRUSTED_SOURCES[domain]

    score = 0.5

    if domain.endswith((".gov", ".gov.in", ".nic.in")):
        score = 0.95
    elif domain.endswith((".edu", ".ac.in")):
        score = 0.85
    elif domain.endswith(".org"):
        score = 0.72

    trusted_kw = ["express", "hindu", "times", "reuters", "herald",
                  "tribune", "post", "wire", "mint", "standard",
                  "news", "press", "journal", "chronicle"]
    spam_kw = ["viral", "buzz", "shocking", "exposed",
               "breaking99", "rumor", "rumour", "truths", "conspirac"]

    if any(kw in domain for kw in trusted_kw):
        score = max(score, 0.68)
    if any(kw in domain for kw in spam_kw):
        score = min(score, 0.25)
    if any(x in domain for x in ["facebook", "twitter", "x.com",
                                   "instagram", "tiktok", "youtube"]):
        score = 0.10

    return clamp(score)


def score_sources(urls, similarity_scores):
    results = []

    for i, url in enumerate(urls):
        domain = get_domain(url)
        source_type = classify_source_type(domain)

        # ✅ Skip low trust sources entirely
        if source_type == "low_trust":
            print(f"⚠️ Skipping low-trust source: {url}")
            continue

        sim = similarity_scores[i] if i < len(similarity_scores) else 0.3
        sim = clamp(sim)

        domain_score = smart_domain_score(domain)
        type_weight = SOURCE_TYPE_WEIGHT.get(source_type, 0.5)

        if sim > 0.8:
            boost = 0.1
        elif sim < 0.3:
            boost = -0.1
        else:
            boost = 0

        adjusted_domain = clamp(domain_score + boost)

        # ✅ Weight by source type
        credibility = (adjusted_domain * 0.6 + sim * 0.4) * type_weight
        credibility = round(clamp(credibility) * 100, 2)

        results.append({
            "url": url,
            "domain": domain,
            "source_type": source_type,
            "similarity": round(sim, 3),
            "credibility": credibility
        })

    return results
