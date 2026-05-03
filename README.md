# AI-Powered Fake News Detector

A full-stack fake news detection app with an intelligent backend and a responsive React frontend.

The system combines:
- **Real-time web search** using Serper
- **Semantic similarity matching** with SentenceTransformers
- **Credibility scoring** for source evaluation
- **Contradiction detection** from article text
- **LLM reasoning** through Groq to produce label, confidence, and explanation
- **Classic ML fallback** with a trained logistic regression model for quick `predict` support

---

## 🚀 What this project does

Users submit a news claim or headline, and the app evaluates it using a hybrid fact-checking pipeline:
1. Search the web for related sources
2. Extract text from top URLs
3. Compare claim vs. document similarity
4. Score each source by credibility
5. Detect contradiction phrases
6. Use an LLM to generate a final verdict

If the LLM is unavailable, the backend falls back to a credibility-based heuristic.

---

## 🧱 Repository structure

```
AI-POWERED-FAKE-NEWS-DETECTOR/
├── backend/
│   ├── main.py
│   ├── predictor.py
│   ├── hybrid_predictor.py
│   ├── rag_engine.py
│   ├── web_verifier.py
│   ├── similarity_engine.py
│   ├── credibility_engine.py
│   ├── contradiction_engine.py
│   ├── requirements.txt
│   └── model/
│       ├── model.pkl
│       ├── vectorizer.pkl
│       ├── prepare_data.py
│       └── train.py
├── frontend/
│   ├── package.json
│   ├── README.md
│   └── src/
│       └── App.jsx
├── requirements.txt
└── README.md
```

---

## 🔧 Tech stack

- Backend: `FastAPI`, `uvicorn`, `python-dotenv`
- Frontend: `React`, `Vite`
- Search: `Serper` API
- LLM: `Groq` (`llama-3.3-70b-versatile`)
- Similarity: `sentence-transformers` (`all-MiniLM-L6-v2`)
- ML model: `scikit-learn` logistic regression
- Web scraping: `requests`, `BeautifulSoup4`

---

## ⚙️ Getting started

### 1. Clone the repository

```bash
git clone https://github.com/YARAGANIDURGADHANUSH/AI-POWERED-FAKE-NEWS-DETECTOR.git
cd AI-POWERED-FAKE-NEWS-DETECTOR
```

### 2. Create and activate a Python environment

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

> If you want to install the shared dependency list, you can also run:
>
> ```bash
> pip install -r requirements.txt
> ```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 🔐 Environment variables

Create a `.env` file in the project root with:

```env
GROQ_API_KEY=your_groq_api_key_here
SERPER_API_KEY=your_serper_api_key_here
```

- `GROQ_API_KEY` is required for LLM verdict generation.
- `SERPER_API_KEY` is required for web source retrieval.

If either key is missing, the backend will continue running in fallback mode, but some features will be limited.

---

## ▶️ Running the app

### Start the backend

```bash
uvicorn backend.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Start the frontend

```bash
cd frontend
npm run dev
```

The React app will usually be available at `http://localhost:5173`.

---

## 🧪 API endpoints

### `GET /`

Health check:

```json
{ "message": "Fake News Detector API is running" }
```

### `POST /verify`

Runs the RAG + LLM pipeline and returns a fact-check verdict.

**Request:**

```json
{ "news": "Example news claim to verify" }
```

**Response:**

```json
{
  "label": "FAKE",
  "confidence": 0.85,
  "explanation": "Multiple credible sources contradict this claim.",
  "differences": [
    "https://example.com → contains: no evidence"
  ],
  "sources": [
    {
      "url": "https://example.com",
      "domain": "example.com",
      "similarity": 0.82,
      "credibility": 91.2
    }
  ]
}
```

### `POST /predict`

Uses the saved ML model to classify text as `Fake` or `Real`.

**Request:**

```json
{ "news": "Example news claim" }
```

**Response:**

```json
{
  "prediction": "Fake",
  "confidence": 0.73
}
```

---

## 📌 Notes

- The `backend/model/train.py` script can retrain the classic ML model if you provide `data/fake_news.csv`.
- `backend/rag_engine.py` handles the full pipeline: search, extract, similarity, credibility, contradiction detection, and LLM judging.
- `frontend/README.md` contains frontend-specific instructions and any UI details.

---

## 💡 Improvements to consider

- Add a dedicated dataset folder and version control for the training data
- Add a user interface for inspection of evidence sources and contradictions
- Improve model persistence with Docker or deployment scripts

---

## 📄 License
 MIT
