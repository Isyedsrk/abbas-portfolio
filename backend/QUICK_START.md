# 🚀 Quick Start Guide

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Get Hugging Face API Key

1. Sign up: https://huggingface.co/join
2. Get token: https://huggingface.co/settings/tokens
3. Create token with **Read** access

## 3. Create `.env` File

Create `backend/.env`:

```env
HUGGINGFACE_API_KEY=your_token_here
HF_MODEL=meta-llama/Llama-3-8B-Instruct
PORT=3000
```

## 4. Generate Embeddings

```bash
npm run embed
```

**First time:** Downloads Xenova model (~80MB), takes 2-3 minutes.

**Output:**
```
✓ Inserted: Learning with AR
✓ Inserted: Obliviate
✓ Inserted: Fruit-Slicer
✓ Inserted: Apna super bazaar
✓ Inserted: Healthease
✓ Inserted: DAR
✅ All projects embedded and stored successfully!
```

## 5. Start Backend

```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
```

## 6. Test Backend

```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Tell me about DAR"}'
```

## 7. Start Frontend

```bash
cd ../frontend
npm install  # if not already done
npm run dev
```

## 8. Test Chat

1. Open http://localhost:5173
2. Click "Ask about my projects" button (top-right)
3. Ask: "What is DAR?"
4. Get AI response! 🎉

---

## ✅ What You Have Now

- ✅ **Local Embeddings** - Xenova (free, no API costs)
- ✅ **Vector Search** - SQLite with cosine similarity
- ✅ **AI Chat** - Hugging Face Llama-3 (free tier)
- ✅ **RAG System** - Context-aware responses
- ✅ **Frontend** - React chat interface

---

## 🐛 Troubleshooting

### "HUGGINGFACE_API_KEY not configured"
→ Create `.env` file with your token

### "Model is loading" (503 error)
→ Wait 30-60 seconds, then retry. First request loads the model.

### Embeddings fail
→ Check internet connection (needs to download model first time)

### Frontend can't connect
→ Make sure backend is running on port 3000
→ Check `vite.config.js` has proxy configured

---

## 📚 Next Steps

- Read `README_RAG.md` for full documentation
- Read `DEPLOYMENT_GUIDE.md` to deploy to Railway/Render
- Customize system prompt in `routes/chat.js`
- Add more projects in `scripts/embedProjects.js`

---

**Ready to deploy?** See `DEPLOYMENT_GUIDE.md` 🚀



