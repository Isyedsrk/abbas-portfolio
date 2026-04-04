# RAG Chatbot - Complete Setup Guide

A fully working RAG (Retrieval-Augmented Generation) chatbot using:
- **Embeddings**: Xenova/all-MiniLM-L6-v2 (local, free)
- **Vector DB**: SQLite (local)
- **LLM**: Hugging Face Inference API (Llama-3 or Mistral)
- **Backend**: Node.js + Express
- **Frontend**: React + Vite

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Get Hugging Face API Key

1. Sign up at https://huggingface.co
2. Get your token: https://huggingface.co/settings/tokens
3. Create a token with **Read** access

### 3. Configure Environment

Create `backend/.env`:

```env
HUGGINGFACE_API_KEY=your_hf_token_here
HF_MODEL=meta-llama/Llama-3-8B-Instruct
PORT=3000
```

### 4. Generate Embeddings

```bash
npm run embed
```

This will:
- Download Xenova model (first time only, ~80MB)
- Generate embeddings for all 6 projects
- Store in SQLite database

### 5. Start Backend

```bash
npm start
```

### 6. Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

## 📁 Project Structure

```
backend/
├── db/
│   └── projects.db          # SQLite with embeddings
├── scripts/
│   └── embedProjects.js     # Generate embeddings with Xenova
├── utils/
│   ├── similarity.js        # Cosine similarity
│   └── retrieve.js          # RAG retrieval
├── routes/
│   └── chat.js              # POST /api/ask endpoint
├── server.js                # Express server
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── ChatBot.jsx      # Main chat component
│   │   ├── ChatBubble.jsx  # Message bubble
│   │   └── ChatButton.jsx   # Floating button
│   └── utils/
│       └── api.js           # API calls
```

## 🔧 How It Works

1. **Embedding Generation** (Xenova):
   - Uses `Xenova/all-MiniLM-L6-v2` model
   - Runs locally (no API calls)
   - Generates 384-dimensional vectors

2. **Vector Search** (SQLite):
   - Stores embeddings as JSON in SQLite
   - Uses cosine similarity for retrieval
   - Returns top-K most relevant projects

3. **LLM Response** (Hugging Face):
   - Uses Llama-3-8B-Instruct via Inference API
   - System prompt enforces context-only answers
   - Prevents hallucination

## 🚢 Deployment (Railway/Render)

### Railway

1. **Connect Repository**:
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select your repo

2. **Set Environment Variables**:
   ```
   HUGGINGFACE_API_KEY=your_token
   HF_MODEL=meta-llama/Llama-3-8B-Instruct
   PORT=3000
   NODE_ENV=production
   ```

3. **Deploy**:
   - Railway auto-detects Node.js
   - Runs `npm install` and `npm start`
   - Your backend is live!

### Render

1. **Create Web Service**:
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repo

2. **Build Settings**:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend` (or leave empty)

3. **Environment Variables**:
   ```
   HUGGINGFACE_API_KEY=your_token
   HF_MODEL=meta-llama/Llama-3-8B-Instruct
   PORT=10000
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Render builds and deploys automatically

### Important Notes for Deployment

1. **Run Embeddings Before Deploying**:
   ```bash
   npm run embed
   ```
   Commit `db/projects.db` to Git so it's included in deployment.

2. **Xenova Model Download**:
   - First run downloads model (~80MB)
   - Model is cached in `node_modules/.cache`
   - Consider pre-downloading in CI/CD

3. **Database Path**:
   - SQLite file is in `db/projects.db`
   - Make sure this directory exists
   - File is created automatically if missing

## 🧪 Testing

### Test Backend

```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me about DAR"}'
```

### Test Frontend

1. Open http://localhost:5173
2. Click "Ask about my projects" button
3. Ask: "What is DAR?"
4. Should get AI-generated response!

## 📊 API Endpoint

### POST `/api/ask`

**Request:**
```json
{
  "question": "What technologies did you use for DAR?"
}
```

**Response:**
```json
{
  "answer": "Based on the portfolio, DAR was built using Android, Java, Machine Learning...",
  "relevantProjects": [
    {
      "title": "DAR",
      "description": "...",
      "links": "https://github.com/..."
    }
  ]
}
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HUGGINGFACE_API_KEY` | HF API token | Yes |
| `HF_MODEL` | Model name (default: meta-llama/Llama-3-8B-Instruct) | No |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (production/development) | No |

## 🐛 Troubleshooting

### Xenova Model Download Fails
- Check internet connection
- Model downloads on first use (~80MB)
- Cached in `node_modules/.cache/huggingface`

### Hugging Face API Errors
- Verify API key is correct
- Check token has read permissions
- Some models may need to load (503 error) - wait and retry

### Embeddings Not Working
- Run `npm run embed` first
- Check `db/projects.db` exists
- Verify SQLite is working

### Deployment Issues
- Make sure `db/projects.db` is committed to Git
- Check environment variables are set
- Verify build logs in Railway/Render dashboard

## 💡 Features

✅ **Local Embeddings** - No API costs for embeddings  
✅ **Free LLM** - Uses Hugging Face free tier  
✅ **RAG** - Context-aware responses  
✅ **No Hallucination** - System prompt enforces context-only  
✅ **Deployable** - Works on Railway/Render  
✅ **Fast** - SQLite vector search is quick  

## 📝 Notes

- First embedding generation takes time (model download)
- Hugging Face models may need 30-60s to load on first request
- SQLite works great for small-medium datasets
- For larger datasets, consider PostgreSQL with pgvector



