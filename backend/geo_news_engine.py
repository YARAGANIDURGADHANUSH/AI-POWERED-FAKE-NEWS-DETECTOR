from web_verifier import verify_with_web
from groq import Groq
import os

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None

def get_dynamic_local_domains(country, region):
    if not client: return []
    
    # Instruct the LLM to fetch the domains dynamically
    prompt = f"List the top 4 local or regional news website domains for {region}, {country}. Return ONLY a raw comma-separated list of domains. Do not include 'www' or 'https'. Example: eenadu.net, sakshi.com, ntnews.com"
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0 # Strict formatting
        )
        
        raw_text = response.choices[0].message.content
        # Clean up the string and split into a clean Python list
        domains = [d.strip().lower() for d in raw_text.split(",") if "." in d]
        print(f"🤖 AI Domain Scout found: {domains}")
        return domains
    except Exception as e:
        print(f"❌ AI Domain Scout Error: {e}")
        return []

def verify_geo_news(claim, country, region):
    print(f"🌍 Starting Geo Analysis for {region}, {country}")
    
    # 1. Ask AI for the best local domains dynamically (~300ms latency)
    allowed_domains = get_dynamic_local_domains(country, region)
    
    # 2. Format the domains so they are compatible with rag_engine.py scoring
    geo_sources_data = [
        {
            "name": domain.split('.')[0].capitalize(), # e.g., 'Eenadu'
            "domain": domain, 
            "bias": "unknown" # AI dynamically fetched this, so we assume neutral starting bias
        } 
        for domain in allowed_domains
    ]

    # 3. Modify search query to include the region name for context
    query = f"{claim} {region} news"
    
    # 4. Define Serper Location Parameter
    search_location = f"{region}, {country}"

    # 5. Run the STRICT search using local domains AND Google's Location targeting
    web_result = verify_with_web(query, allowed_domains=allowed_domains, location=search_location)

    return {
        "query_used": web_result.get("query_used", query),
        "geo_sources": geo_sources_data, 
        "sources": web_result.get("sources", [])
    }
