# Deployment Guide for Railway & Render

## Important: Ollama vs Cloud Deployment

**Ollama is designed for local use** - it runs AI models on your local machine. For cloud deployment (Railway, Render, etc.), you need a different approach.

## Recommended for Cloud Deployment: Hugging Face

Hugging Face is perfect for cloud deployment because:
- ✅ Works on any cloud platform
- ✅ Free tier available
- ✅ No local model installation needed
- ✅ API-based (perfect for serverless/containers)

---

## Deployment on Railway

### Step 1: Prepare Your Code

Your code is already set up! Just make sure your `.env` is configured for Hugging Face.

### Step 2: Deploy to Railway

1. **Create a Railway account** (if you don't have one)
   - Go to: https://railway.app
   - Sign up with GitHub

2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - Go to your project settings
   - Add these environment variables:
     ```
     AI_PROVIDER=huggingface
     HUGGINGFACE_API_KEY=your_huggingface_token_here
     PORT=3000
     NODE_ENV=production
     ```

4. **Get Hugging Face Token** (if you don't have one)
   - Go to: https://huggingface.co/settings/tokens
   - Create a new token (read access is enough)
   - Copy it to Railway environment variables

5. **Deploy!**
   - Railway will automatically detect your Node.js app
   - It will install dependencies and start your server
   - Your backend will be live!

### Railway Configuration

Railway will automatically:
- Detect `package.json` and install dependencies
- Run `npm start` (make sure this is in your package.json)
- Expose your app on a public URL

---

## Deployment on Render

### Step 1: Prepare Your Code

Same as Railway - your code is ready!

### Step 2: Deploy to Render

1. **Create a Render account**
   - Go to: https://render.com
   - Sign up (free tier available)

2. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Build Settings**
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if deploying only backend)

4. **Set Environment Variables**
   - Go to "Environment" tab
   - Add these variables:
     ```
     AI_PROVIDER=huggingface
     HUGGINGFACE_API_KEY=your_huggingface_token_here
     PORT=10000
     NODE_ENV=production
     ```
   - **Note**: Render uses port 10000 by default, or use `$PORT` variable

5. **Get Hugging Face Token**
   - Same as Railway: https://huggingface.co/settings/tokens
   - Create token and add to Render environment variables

6. **Deploy!**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your backend will be live!

---

## Alternative: Use Hugging Face Inference Endpoints (Free)

If you want even better performance, you can use Hugging Face Inference Endpoints:

1. Go to: https://huggingface.co/inference-endpoints
2. Create a free endpoint
3. Use the endpoint URL in your code

---

## Environment Variables for Production

Create a `.env` file or set these in your platform:

```env
# Required for cloud deployment
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_token_here

# Server config
PORT=3000
NODE_ENV=production

# Database (SQLite works on both platforms)
DB_PATH=./db/projects.db
```

---

## Frontend Configuration

After deploying your backend, update your frontend to point to the deployed URL:

1. **Update `frontend/src/utils/api.js`**:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 
     (import.meta.env.DEV ? '' : 'https://your-backend.railway.app');
   ```

2. **Or set environment variable in frontend**:
   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```

---

## Troubleshooting

### Backend not starting?
- Check logs in Railway/Render dashboard
- Make sure `PORT` environment variable is set correctly
- Verify `npm start` script exists in package.json

### Hugging Face API errors?
- Verify your API token is correct
- Check token has read permissions
- Some models may have rate limits on free tier

### Database issues?
- SQLite works on both platforms
- Make sure `db/` directory exists
- Database file will be created automatically

### CORS errors?
- Make sure CORS is enabled in your backend (it already is)
- Add your frontend URL to CORS whitelist if needed

---

## Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Railway** | $5/month credit | Pay as you go |
| **Render** | Free tier available | Starts at $7/month |
| **Hugging Face** | Free tier | Free for most use cases |

**Total cost for free deployment: $0/month** (using free tiers)

---

## Recommended Setup for Production

1. **Backend**: Deploy on Railway or Render with Hugging Face
2. **Frontend**: Deploy on Netlify, Vercel, or Render (all have free tiers)
3. **Database**: SQLite (included) or upgrade to PostgreSQL if needed

This gives you a **completely free, production-ready deployment**!

---

## Quick Deploy Checklist

- [ ] Hugging Face account created
- [ ] Hugging Face API token generated
- [ ] Railway/Render account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Backend deployed and running
- [ ] Frontend updated with backend URL
- [ ] Test the chat functionality

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Hugging Face Docs: https://huggingface.co/docs



