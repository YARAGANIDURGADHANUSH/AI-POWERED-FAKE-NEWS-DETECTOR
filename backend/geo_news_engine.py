from geo_sources_config import GEO_SOURCES
from web_verifier import verify_with_web

from geo_sources_config import GEO_SOURCES
from web_verifier import verify_with_web


def get_geo_sources(country, region):
    return GEO_SOURCES.get(country.lower(), {}).get(region.lower(), [])


def verify_geo_news(claim, country, region):
    geo_sources = get_geo_sources(country, region)

    # 🔥 Improved query
    query = f"{claim} {region} news fact check analysis"

    web_result = verify_with_web(query)

    return {
        "query_used": query,
        "geo_sources": geo_sources,
        "sources": web_result.get("sources", [])
    }
def get_geo_sources(country, region):
    country = country.lower()
    region = region.lower()

    return GEO_SOURCES.get(country, {}).get(region, [])


def build_geo_query(claim, region):
    return f"{claim} {region} news"


def verify_geo_news(claim, country, region):
    geo_sources = get_geo_sources(country, region)

    # Modify search query
    query = build_geo_query(claim, region)

    web_result = verify_with_web(query)

    return {
        "query_used": query,
        "geo_sources": geo_sources,
        "sources": web_result.get("sources", [])
    }
