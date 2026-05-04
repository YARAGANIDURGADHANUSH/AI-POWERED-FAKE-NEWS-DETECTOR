from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from groq import Groq
import os, json, re

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
