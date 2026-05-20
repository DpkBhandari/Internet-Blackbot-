# Internet Black Box (IBB) — Frontend

## Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```
Opens at **http://localhost:5173**

## Environment
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Pages
| Path | Description |
|------|-------------|
| /app/dashboard | Overview with charts |
| /app/upload | File upload center |
| /app/analysis | Analysis list |
| /app/sentiment | Sentiment charts & timeline |
| /app/trends | Keyword heatmap & trending topics |
| /app/misinformation | Risk scoring & claim detection |
| /app/research | Semantic search & explorer |
| /app/sources | Source trust scoring |
| /app/credibility | Trust radar & scatter chart |
| /app/fact-check | Claim verification by verdict |
| /app/citations | APA/MLA/Chicago/Harvard export |
| /app/semantic | Document similarity heatmap |
| /app/ai/assistant | Persistent AI chat (survives navigation) |
| /app/ai/insights | AI-derived patterns & risks |
| /app/ai/recommendations | Personalized research guidance |
| /app/ai/history | Browse all past conversations |
| /admin/dashboard | Admin overview (admin role required) |

## Build
```bash
npm run build
# Output: dist/
```

## Tech Stack
React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · Recharts · React Query · Zustand · Socket.IO
