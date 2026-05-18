# Curalink - AI Medical Research Assistant (MERN)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-FFFFFF?style=for-the-badge&logo=Ollama&logoColor=black)

**Curalink** is a full-stack AI medical research assistant that grounds every answer in peer-reviewed publications and clinical trials. It aggregates evidence from OpenAlex, PubMed, and ClinicalTrials.gov, ranks sources, and returns structured, cited summaries.

## Key Features

- JWT auth with password hashing and user-scoped sessions
- Medical context capture (patient, disease, location, additional context)
- Multi-source retrieval with ranking and evidence grounding
- Structured responses with citations, trials, safety notes, and limitations
- Local LLM support via Ollama with optional provider fallbacks

## Tech Stack

| Category | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js, JWT |
| Database | MongoDB, Mongoose |
| APIs | OpenAlex, PubMed, ClinicalTrials.gov |
| LLM | Ollama (default), optional Hugging Face, Groq |

## Architecture Flow

1. User registers or logs in to receive a JWT.
2. User submits a question with medical context.
3. Backend validates auth (optional for trial), loads history, and expands the query.
4. Retrieval pulls candidates from OpenAlex, PubMed, and ClinicalTrials.gov.
5. Ranking selects top evidence for LLM reasoning.
6. LLM returns a structured, cited response.
7. Sessions and sources persist to MongoDB.

## Setup & Installation

### 1) Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Ollama (optional, for local LLM)

### 2) Install dependencies

From the repo root:

```bash
npm install
```

### 3) Environment variables

Create .env files based on .env.example in both server/ and curalink-ai-research/.

server/.env (minimum)

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/curalink
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_here

# LLM Configuration
LLM_PROVIDER=ollama
LLM_FALLBACK_PROVIDER=groq
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b

# Optional API keys
HF_API_KEY=your_huggingface_api_key
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
OPENALEX_API_KEY=your_openalex_api_key

# NCBI (PubMed) Configuration
NCBI_API_KEY=your_ncbi_api_key
NCBI_TOOL=curalink
NCBI_EMAIL=you@example.com
```

curalink-ai-research/.env (minimum)

```bash
VITE_API_BASE_URL=http://localhost:5000
```

### 4) Optional: local LLM

```bash
ollama pull llama3.1:8b
ollama serve
```

### 5) Run the app

Backend (from server/):

```bash
npm run dev
```

Frontend (from curalink-ai-research/):

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health

## API Reference

### Auth

POST /api/auth/register

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "patientName": "John Doe",
  "disease": "Type 2 Diabetes",
  "additionalQuery": "Metformin + comorbidities",
  "location": "Boston, MA"
}
```

POST /api/auth/login

```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

### Chat

POST /api/chat/message

```json
{
  "sessionId": "session-123",
  "message": "Latest treatment for lung cancer",
  "patientName": "John Smith",
  "disease": "Lung cancer",
  "additionalQuery": "Immunotherapy",
  "location": "Toronto, Canada",
  "retrievalDepth": 180
}
```

GET /api/chat/conversation/:sessionId

GET /api/chat/conversations

## Notes

- Guests can send one request, then the UI prompts login.
- Logged-in users see their saved sessions from MongoDB.