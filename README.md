# RAG

An Interactive Agentic Self-RAG Platform that visualizes every reasoning step of the retrieval pipeline in real time.

## Architecture

- **Frontend**: Next.js 14, React Flow, Tailwind CSS, Zustand, Framer Motion
- **Backend**: FastAPI, LangGraph, LangChain
- **AI**: Google Gemini (gemini-2.0-flash + text-embedding-004)
- **Vector DB**: ChromaDB

## Setup

### 1. Environment Variables

```bash
cp .env.example .env
# Fill in your GOOGLE_API_KEY
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Self-RAG Workflow

```
User Question
    ↓
Need Retrieval?
  ├── No  → Generate Direct Answer → END
  └── Yes → Retrieve Documents
              ↓
           Grade Documents (per chunk)
              ├── No relevant docs → No Answer Found
              └── Relevant docs → Generate Answer
                                      ↓
                                 Grounded?
                                  ├── No (retry < 10) → Revise Answer → loop
                                  └── Yes → Useful?
                                               ├── Yes → Return Answer
                                               └── No  → No Answer Found
```

Every node streams a trace event to the frontend (SSE), which animates the React Flow execution graph in real time.
