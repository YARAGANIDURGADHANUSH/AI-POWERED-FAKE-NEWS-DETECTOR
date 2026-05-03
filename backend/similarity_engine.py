# backend/similarity_engine.py

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")

def compute_similarity(claim, documents):
    claim_emb = model.encode([claim])
    doc_embs = model.encode(documents)

    scores = cosine_similarity(claim_emb, doc_embs)[0]

    return scores.tolist()