from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from groq import Groq
import os, json, re
from dotenv import load_dotenv

load_dotenv()

model = SentenceTransformer("all-MiniLM-L6-v2")
client = Groq(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None

def compute_similarity(claim, documents):
    claim_emb = model.encode([claim])
    doc_embs = model.encode(documents)
    scores = cosine_similarity(claim_emb, doc_embs)[0]
    return scores.tolist()

def analyze_content_llm(claim, article_text, url):
    if not client:
        return {"relation": "irrelevant"}

    prompt = f"""
Claim: "{claim}"
Article: "{article_text[:800]}"

Classify relation:
- support
- contradict
- irrelevant

Return JSON:
{{"relation": "..."}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        raw = response.choices[0].message.content
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass

    return {"relation": "irrelevant"}

# ✅ THE MISSING FUNCTION THAT CRASHED YOUR APP
def analyze_claim(claim: str, search_results: list):
    """Takes the claim and web search results, asks Llama-3 to evaluate, and returns JSON."""
    if not client:
        return {"confidence": 0, "explanation": "API Key missing. Cannot analyze."}

    # Prepare the evidence context from the search results
    context = ""
    for idx, res in enumerate(search_results[:4]): # Feed top 4 articles to the LLM
        context += f"Source {idx+1}: {res.get('title')} - {res.get('snippet')}\n"

    prompt = f"""
    You are an expert, impartial fact-checking AI. 
    Claim to verify: "{claim}"

    Here is the live web evidence:
    {context}

    Based ONLY on the evidence above, evaluate the claim.
    Return a JSON object with exactly these keys:
    - "confidence": an integer between 0 and 100 representing how factually true the claim is (0 = completely fake, 100 = completely true).
    - "explanation": a concise, 2-sentence explanation of your verdict based on the sources.

    JSON format strictly required:
    {{"confidence": 80, "explanation": "..."}}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        raw = response.choices[0].message.content
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        
        if match:
            data = json.loads(match.group())
            return {
                "confidence": int(data.get("confidence", 0)),
                "explanation": data.get("explanation", "Analysis complete.")
            }
    except Exception as e:
        print(f"❌ LLM Analysis Error: {e}")
    
    return {"confidence": 0, "explanation": "Failed to analyze claim due to an internal LLM error."}
