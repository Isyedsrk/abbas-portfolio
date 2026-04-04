# Portfolio Backend - AI + RAG Chat System

A Node.js + Express + SQLite backend with AI-powered chat using RAG (Retrieval-Augmented Generation) to answer questions about portfolio projects.

## Features

- 🤖 AI-powered chat with **multiple free options**:
  - **Hugging Face** ⭐ (RECOMMENDED - Best quality, 1,000 req/day free)
  - **Ollama** (100% free, local, no limits)
  - OpenAI (optional, paid)
  
  **👉 See [BEST_FREE_AI_GUIDE.md](./BEST_FREE_AI_GUIDE.md) for complete setup with links!**
- 🔍 RAG (Retrieval-Augmented Generation) for context-aware responses
- 💾 SQLite database for storing project embeddings
- 🚀 Express.js REST API
- 📊 Cosine similarity for semantic search

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

**Option 1: Use Hugging Face ⭐ (RECOMMENDED - Best Quality, Free)**
```env
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_token_here
PORT=3000
```
🔗 **Quick Setup:** See [BEST_FREE_AI_GUIDE.md](./BEST_FREE_AI_GUIDE.md) for step-by-step instructions with direct links!

**Option 2: Use Ollama (100% Free, Local)**
```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
PORT=3000
```

**Option 3: Use OpenAI (Paid)**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

**👉 For the BEST free AI setup with direct links, see: [BEST_FREE_AI_GUIDE.md](./BEST_FREE_AI_GUIDE.md)**

**See also:**
- [SETUP_BETTER_AI.md](./SETUP_BETTER_AI.md) - Hugging Face quick setup
- [README_FREE_AI.md](./README_FREE_AI.md) - Detailed free AI options

### 3. Generate Embeddings

Run the script to generate embeddings for all projects and store them in the database:

```bash
npm run embed
```

This will:
- Create the SQLite database (`db/projects.db`)
- Generate embeddings for each project using OpenAI's `text-embedding-3-small` model
- Store project data and embeddings in the database

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### POST `/api/ask`

Ask a question about the portfolio projects.

**Request Body:**
```json
{
  "question": "Tell me about the AR project"
}
```

**Response:**
```json
{
  "answer": "Learning with AR is a project that enhances education...",
  "relevantProjects": [
    {
      "title": "Learning with AR",
      "description": "...",
      "links": "..."
    }
  ]
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Project Structure

```
backend/
├── db/
│   └── projects.db          # SQLite database
├── scripts/
│   └── embedProjects.js     # Script to generate embeddings
├── utils/
│   ├── similarity.js        # Cosine similarity function
│   └── retrieve.js          # RAG retrieval logic
├── routes/
│   └── chat.js              # AI chat route
├── server.js                # Express server
├── package.json
├── .env                     # Environment variables
└── README.md
```

## How It Works

1. **Embedding Generation**: Projects are embedded using OpenAI's embedding model and stored in SQLite.

2. **Query Processing**: When a user asks a question:
   - The question is converted to an embedding
   - Cosine similarity is used to find relevant projects
   - Top-K most relevant projects are retrieved

3. **AI Response**: The retrieved context is passed to GPT-3.5-turbo along with the user's question to generate an accurate, context-aware response.

## Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `openai` - OpenAI API client
- `sqlite3` - SQLite database driver

## Notes

- Make sure you have a valid OpenAI API key
- The embedding model used is `text-embedding-3-small` (cost-effective)
- The chat model used is `gpt-3.5-turbo` (can be changed to `gpt-4` for better results)
- Similarity threshold is set to 0.7 (adjustable in `retrieve.js`)

