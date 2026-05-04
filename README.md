# 🔍 AI-Powered Fake News Detector

An intelligent fake news detection system that combines **LLM reasoning**, **RAG (Retrieval-Augmented Generation)**, **semantic similarity**, and **real-time web verification** to fact-check news claims with source credibility scoring.

---

## 🚀 Features

- ✅ **LLM-based verdict** — Uses `llama-3.3-70b-versatile` via Groq to analyze claims
- 🌐 **Real-time web search** — Fetches live sources via Serper (Google Search API)
- 📊 **Credibility scoring** — Automatically scores any domain (no manual entry needed)
- 🔗 **Semantic similarity** — Uses `sentence-transformers` to match claim vs source content
- ⚠️ **Contradiction detection** — Flags sources that contradict the claim
- 🎨 **React frontend** — Clean, responsive UI with color-coded verdicts

---

## 🏗️ Project Structure

```
fake-news-detector/
│
├── backend/
│   ├── main.py                  # FastAPI app & API routes
│   ├── predictor.py             # ML model-based predictor (pickle)
│   ├── hybrid_predictor.py      # Connects to RAG pipeline
│   ├── rag_engine.py            # Core pipeline (search → extract → score → LLM)
│   ├── web_verifier.py          # Serper Google Search integration
│   ├── similarity_engine.py     # Sentence-transformer similarity scoring
│   ├── credibility_engine.py    # Smart domain credibility scoring
│   ├── contradiction_engine.py  # Contradiction phrase detection
│   └── model/
│       ├── model.pkl            # Trained ML model
│       └── vectorizer.pkl       # TF-IDF vectorizer
│
├── frontend/
│   └── src/
│       └── App.jsx              # React frontend
│
├── .env                         # API keys (never commit this)
├── requirements.txt
└── README.md
```

---

## ⚙️ How It Works

```
User enters claim
       │
       ▼
🌐 Web Search (Serper API)
       │
       ▼
📄 Extract content from top 5 URLs
       │
       ▼
🧮 Semantic Similarity (sentence-transformers)
       │
       ▼
📊 Credibility Scoring (domain trust + similarity)
       │
       ▼
⚠️  Contradiction Detection
       │
       ▼
🧠 LLM Judge (Groq llama-3.3-70b)
       │
       ▼
✅ Final Verdict: REAL / FAKE / PARTIALLY TRUE / UNCERTAIN
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| LLM | Groq API (`llama-3.3-70b-versatile`) |
| Web Search | Serper API (Google Search) |
| Similarity | `sentence-transformers` (`all-MiniLM-L6-v2`) |
| ML Model | Scikit-learn (pickle) |
| Scraping | BeautifulSoup4 |
| Env Management | python-dotenv |

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/fake-news-detector.git
cd fake-news-detector
```

### 2. Set up Python environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
SERPER_API_KEY=your_serper_api_key_here
```

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — Free tier available |
| `SERPER_API_KEY` | [serper.dev](https://serper.dev) — 2500 free searches/month |

---

## ▶️ Running the Project

### Start the backend

```bash
# From project root
uvicorn backend.main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

### Start the frontend

```bash
# In a new terminal
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### `GET /`
Health check
```json
{ "message": "Fake News Detector API is running" }
```

### `POST /verify`
Main fact-checking endpoint (RAG + LLM pipeline)

**Request:**
```json
{ "news": "NASA confirms aliens landed in Texas" }
```

**Response:**
```json
{
  "label": "FAKE",
  "confidence": 0.92,
  "explanation": "No credible sources support this claim...",
  "differences": ["bbc.com → reports no evidence"],
  "sources": [
    {
      "url": "https://bbc.com/...",
      "domain": "bbc.com",
      "similarity": 0.812,
      "credibility": 83.4
    }
  ]
}
```

### `POST /predict`
ML model-only prediction (faster, no web search)

**Request:**
```json
{ "news": "Some news headline here" }
```

**Response:**
```json
{
  "prediction": "Real",
  "confidence": 0.87
}
```

---

## 📊 Verdict Labels

| Label | Meaning | Color |
|---|---|---|
| ✅ REAL | Claim is supported by credible sources | Green |
| ❌ FAKE | Claim is false or fabricated | Red |
| ⚠️ PARTIALLY TRUE | Some truth but misleading or incomplete | Orange |
| ❓ UNCERTAIN | Insufficient evidence to decide | Grey |

---

## 🧠 Credibility Scoring

Domain credibility is scored automatically using a 3-layer system:

1. **Manual trusted list** — Known reliable sources (BBC, Reuters, Indian Express, etc.) get preset scores
2. **TLD-based scoring** — `.gov.in` → 0.95, `.edu` → 0.85, `.org` → 0.72
3. **Keyword signals** — Domains with "express", "herald", "tribune" get boosted; "viral", "buzz", "exposed" get penalized

Final credibility formula:
```
credibility = (domain_score × 0.6) + (semantic_similarity × 0.4)
```

---

## 📋 Requirements

Create a `requirements.txt` with:

```
fastapi
uvicorn
pydantic
python-dotenv
requests
beautifulsoup4
groq
sentence-transformers
scikit-learn
numpy
```

---

## 🐛 Common Issues

| Issue | Fix |
|---|---|
| `GROQ_API_KEY missing` | Add key to `.env` file |
| `SERPER_API_KEY not found` | Add key to `.env` file |
| Credibility shows wrong % | Restart backend after editing `credibility_engine.py` |
| `Backend connection failed` | Make sure `uvicorn` is running on port 8000 |
| CORS error in browser | Already handled in `main.py` with `allow_origins=["*"]` |

---

## 🔮 Future Improvements

- [ ] Add support for image-based fake news detection
- [ ] Multilingual support (Hindi, Telugu, Tamil)
- [ ] Browser extension for real-time checking
- [ ] History of checked claims
- [ ] User feedback to improve model accuracy
- [ ] WhatsApp/Telegram bot integration

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — Ultra-fast LLM inference
- [Serper](https://serper.dev) — Google Search API
- [Sentence Transformers](https://www.sbert.net) — Semantic similarity
- [FastAPI](https://fastapi.tiangolo.com) — Backend framework
