# Internet Black Box (IBB) — AI Service

## Quick Start
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Runs at **http://localhost:8000**

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET  | /health | Health check |
| POST | /analyze | Full document analysis pipeline |
| POST | /sentiment | Sentiment classification |
| POST | /summary | Text summarization |
| POST | /keywords | Keyword extraction |
| POST | /toxicity | Toxicity detection |
| POST | /misinformation | Misinfo scoring + claim extraction |
| POST | /semantic-search | Semantic similarity search |
| POST | /chat | AI research chat |

## Models Used (auto-downloaded)
- `distilbert-base-uncased-finetuned-sst-2-english` — sentiment
- `sshleifer/distilbart-cnn-12-6` — summarization
- `all-MiniLM-L6-v2` — semantic embeddings

## Notes
- All models load lazily on first request (~500MB total)
- App works without GPU (slower inference)
- Every endpoint has rule-based fallback if model unavailable
