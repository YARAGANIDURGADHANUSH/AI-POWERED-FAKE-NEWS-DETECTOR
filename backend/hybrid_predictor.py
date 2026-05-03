from backend.rag_engine import rag_pipeline

def hybrid_predict(news_text):
    return rag_pipeline(news_text)