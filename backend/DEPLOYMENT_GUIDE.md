# Deployment Guide - Railway & Render

## 🚀 Quick Deploy Checklist

### Before Deploying:

1. ✅ Run `npm run embed` locally to generate embeddings
2. ✅ Commit `db/projects.db` to Git
3. ✅ Set up Hugging Face API key
4. ✅ Test locally first

---

## Railway Deployment

### Step 1: Connect Repository
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 2: Configure Environment Variables
In Railway dashboard → Variables tab, add:

```
HUGGINGFACE_API_KEY=your_hf_token_here
HF_MODEL=meta-llama/Llama-3-8B-Instruct
PORT=3000
NODE_ENV=production
```

### Step 3: Deploy
- Railway auto-detects Node.js
- Runs `npm install` automatically
- Starts with `npm start`
- Your backend is live!

### Step 4: Get Your URL
- Railway provides a public URL
- Example: `https://your-app.railway.app`
- Use this in your frontend `VITE_API_URL`

---

## Render Deployment

### Step 1: Create Web Service
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Build Settings
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: Leave empty (or set to `backend`)

### Step 3: Set Environment Variables
In Render dashboard → Environment tab:

```
HUGGINGFACE_API_KEY=your_hf_token_here
HF_MODEL=meta-llama/Llama-3-8B-Instruct
PORT=10000
NODE_ENV=production
```

**Note**: Render uses port 10000 by default, or use `$PORT` variable.

### Step 4: Deploy
- Click "Create Web Service"
- Render builds and deploys
- Your backend is live!

---

## Frontend Deployment

### Update Frontend API URL

In `frontend/src/utils/api.js` or set environment variable:

```javascript
// For production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.railway.app';
```

Or create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend.railway.app
```

### Deploy Frontend

**Netlify/Vercel:**
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL`

**Render:**
1. Create new Static Site
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## Important Notes

### 1. Database File
- Make sure `db/projects.db` is committed to Git
- SQLite works on Railway/Render
- File persists between deployments

### 2. Xenova Model
- First run downloads model (~80MB)
- Model cached in `node_modules/.cache`
- Consider pre-downloading in build step

### 3. Hugging Face API
- Free tier has rate limits
- Models may need 30-60s to load
- 503 errors are normal on first request

### 4. Environment Variables
- Never commit `.env` file
- Set all variables in platform dashboard
- Double-check `HUGGINGFACE_API_KEY` is set

---

## Troubleshooting

### Backend won't start?
- Check `PORT` environment variable
- Verify `npm start` script exists
- Check build logs for errors

### Embeddings not working?
- Make sure `db/projects.db` exists
- Run `npm run embed` before deploying
- Check file is committed to Git

### Hugging Face errors?
- Verify API key is correct
- Check token has read permissions
- Wait for model to load (503 → retry)

### CORS errors?
- CORS is enabled in backend
- Check frontend URL is correct
- Verify backend URL in frontend config

---

## Cost Estimate

**Free Tier:**
- Railway: $5/month credit (usually enough)
- Render: Free tier available
- Hugging Face: Free tier (generous limits)
- **Total: $0-5/month**

---

## Success Checklist

- [ ] Backend deployed and running
- [ ] Environment variables set
- [ ] Database file included
- [ ] Frontend updated with backend URL
- [ ] Test chat functionality
- [ ] Verify embeddings work
- [ ] Check Hugging Face API responses

🎉 **You're all set!**



