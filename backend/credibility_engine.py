from urllib.parse import urlparse

# ✅ Keep only the most important/verified sources
# Everything else gets auto-scored
TRUSTED_SOURCES = {
    # International wire services (highest trust)
    "reuters.com": 0.95,
    "apnews.com": 0.95,
    "bbc.com": 0.92,
    "bbc.co.uk": 0.92,
    # Indian fact-checkers (high trust)
    "boomlive.in": 0.88,
    "altnews.in": 0.87,
    "newschecker.in": 0.82,
    "vishvasnews.com": 0.80,
    # International fact-checkers
    "factcheck.org": 0.92,
    "snopes.com": 0.88,
    "politifact.com": 0.88,
    "factcheck.afp.com": 0.90,
    # Top Indian news
    "thehindu.com": 0.88,
    "indianexpress.com": 0.85,
    "theprint.in": 0.80,
    "scroll.in": 0.78,
    "thequint.com": 0.80,
    "ndtv.com": 0.78,
    # Top international news
    "theguardian.com": 0.87,
    "washingtonpost.com": 0.87,
    "nytimes.com": 0.88,
    "bloomberg.com": 0.85,
    "economist.com": 0.88,
    # Government
    "pib.gov.in": 0.95,
    "who.int": 0.95,
    "cdc.gov": 0.95,
}

FACT_CHECK_DOMAINS = {
    "boomlive.in", "altnews.in", "newschecker.in",
    "vishvasnews.com", "factcheck.org", "snopes.com",
    "politifact.com", "factcheck.afp.com", "thequint.com",
    "logically.ai", "africacheck.org", "fullfact.org",
}

TRUSTED_NEWS_DOMAINS = {
    "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk",
    "thehindu.com", "indianexpress.com", "ndtv.com",
    "theguardian.com", "washingtonpost.com", "nytimes.com",
    "bloomberg.com", "theprint.in", "scroll.in",
    "hindustantimes.com", "livemint.com", "business-standard.com",
    "deccanherald.com", "tribuneindia.com", "thestatesman.com",
    "pbs.org", "npr.org", "economist.com", "ft.com",
}

LOW_TRUST_DOMAINS = {
    "twitter.com", "x.com", "facebook.com", "instagram.com",
    "tiktok.com", "youtube.com", "reddit.com", "t.me",
    "whatsapp.com", "telegram.org",
}

SOURCE_TYPE_WEIGHT = {
    "fact_check":   1.0,
    "trusted_news": 0.85,
    "gov_edu":      0.90,
    "unknown":      0.55,
    "low_trust":    0.0,   # filtered out
}


def get_domain(url):
    """Extract clean domain from URL"""
    try:
        netloc = urlparse(url).netloc
        # Remove port if present
        netloc = netloc.split(":")[0]
        # Remove www. and m. prefixes
        for prefix in ["www.", "m.", "mobile.", "amp."]:
            if netloc.startswith(prefix):
                netloc = netloc[len(prefix):]
        return netloc.lower()
    except:
        return ""


def resolve_domain_score(domain):
    """
    Smart domain resolution:
    1. Try exact match
    2. Try stripping subdomains progressively
    3. Fall back to auto-scoring
    """
    # 1️⃣ Exact match
    if domain in TRUSTED_SOURCES:
        return TRUSTED_SOURCES[domain], "exact"

    # 2️⃣ Strip subdomains progressively
    # e.g. timesofindia.indiatimes.com → indiatimes.com → com
    parts = domain.split(".")
    for i in range(1, len(parts) - 1):
        base = ".".join(parts[i:])
        if base in TRUSTED_SOURCES:
            return TRUSTED_SOURCES[base], "subdomain"

    return None, "auto"


def classify_source_type(domain):
    """Classify domain into source type"""
    # Check exact + subdomains
    parts = domain.split(".")
    candidates = [domain] + [
        ".".join(parts[i:]) for i in range(1, len(parts) - 1)
    ]

    for candidate in candidates:
        if candidate in LOW_TRUST_DOMAINS:
            return "low_trust"
        if candidate in FACT_CHECK_DOMAINS:
            return "fact_check"
        if candidate in TRUSTED_NEWS_DOMAINS:
            return "trusted_news"

    # TLD-based
    if any(domain.endswith(tld) for tld in [".gov", ".gov.in", ".nic.in", ".edu", ".ac.in", ".int"]):
        return "gov_edu"

    return "unknown"


def auto_score_domain(domain):
    """
    Automatically score any unknown domain
    based on signals — no manual entry needed
    """
    score = 0.50  # neutral default

    # TLD signals
    if domain.endswith((".gov", ".gov.in", ".nic.in")):
        score = 0.92
    elif domain.endswith((".edu", ".ac.in", ".edu.in")):
        score = 0.85
    elif domain.endswith(".int"):
        score = 0.90
    elif domain.endswith(".org"):
        score = 0.68
    elif domain.endswith((".co.in", ".in")):
        score = 0.55  # Indian domain — slight boost

    # Trusted keyword signals in domain name
    TRUST_KEYWORDS = [
        "news", "press", "times", "express", "herald", "tribune",
        "post", "journal", "chronicle", "wire", "dispatch",
        "standard", "mirror", "gazette", "monitor", "report",
        "hindu", "india", "reuters", "associated", "national",
        "daily", "weekly", "media", "broadcast", "public",
        "factcheck", "fact-check", "snopes", "verify", "check",
        "debunk", "truth", "hoax", "rumor", "mislead",
    ]

    SPAM_KEYWORDS = [
        "viral", "buzz", "shock", "exposing", "exposed",
        "breakingnow", "breaking99", "rumours", "conspiracy",
        "hidden", "secret", "realtruth", "wakeup", "agenda",
        "illuminati", "deepstate", "fwd", "forward",
    ]

    domain_lower = domain.lower()

    if any(kw in domain_lower for kw in TRUST_KEYWORDS):
        score = max(score, 0.65)

    if any(kw in domain_lower for kw in SPAM_KEYWORDS):
        score = min(score, 0.20)

    # Social media penalty
    if any(x in domain_lower for x in [
        "facebook", "twitter", "x.com", "instagram",
        "tiktok", "youtube", "reddit", "whatsapp"
    ]):
        score = 0.05

    return round(min(max(score, 0.0), 1.0), 3)


def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(v, hi))


def score_sources(urls, similarity_scores):
    results = []

    for i, url in enumerate(urls):
        domain = get_domain(url)
        if not domain:
            continue

        source_type = classify_source_type(domain)

        # ✅ Filter out low trust sources completely
        if source_type == "low_trust":
            print(f"⚠️ Filtered low-trust: {url}")
            continue

        sim = similarity_scores[i] if i < len(similarity_scores) else 0.3
        sim = clamp(sim)

        # Get domain score
        trusted_score, match_type = resolve_domain_score(domain)

        if trusted_score is not None:
            domain_score = trusted_score
            print(f"✅ {match_type} match: {domain} → {domain_score}")
        else:
            domain_score = auto_score_domain(domain)
            print(f"🤖 Auto-scored: {domain} → {domain_score}")

        # Similarity-based boost/penalty
        if sim > 0.80:
            boost = +0.08
        elif sim > 0.60:
            boost = +0.04
        elif sim < 0.30:
            boost = -0.10
        else:
            boost = 0.0

        adjusted = clamp(domain_score + boost)

        # Type weight
        type_weight = SOURCE_TYPE_WEIGHT.get(source_type, 0.55)

        # Final credibility (0–100)
        credibility = (adjusted * 0.65 + sim * 0.35) * type_weight
        credibility = round(clamp(credibility) * 100, 1)

        results.append({
            "url":         url,
            "domain":      domain,
            "source_type": source_type,
            "match_type":  match_type,
            "similarity":  round(sim, 3),
            "credibility": credibility,
        })

    return results
