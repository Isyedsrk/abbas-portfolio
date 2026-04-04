# Free AI Setup Guide

This backend now supports **completely free AI alternatives** that work forever!

## Option 1: Ollama (Recommended - 100% Free, Local)

Ollama runs AI models locally on your computer - completely free, no API keys needed, no usage limits!

### Setup Steps:

1. **Install Ollama:**
   - Download from: https://ollama.ai
   - Install for Windows/Mac/Linux
   - It's a simple installer, just run it

2. **Download a model:**
   ```bash
   ollama pull llama3.2
   ```
   Or try other models:
   ```bash
   ollama pull mistral
   ollama pull phi3
   ```

3. **Start Ollama:**
   - Ollama runs automatically after installation
   - It starts a local server on `http://localhost:11434`

4. **Configure your .env:**
   ```env
   AI_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```

5. **That's it!** Your backend will now use Ollama for free AI responses.

### Benefits:
- ✅ 100% free forever
- ✅ No API keys needed
- ✅ No usage limits
- ✅ Works offline
- ✅ Private (data stays on your machine)
- ✅ Multiple free models available

---

## Option 2: Hugging Face (Free Tier)

Hugging Face offers a free tier with generous limits. **Perfect for cloud deployment!**

### Quick Setup:

1. **Create a free account:** https://huggingface.co
2. **Get your API token:** https://huggingface.co/settings/tokens
3. **Add to .env:**
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=your_token_here
   ```
4. **Restart your backend**

**📖 See [HUGGINGFACE_SETUP.md](./HUGGINGFACE_SETUP.md) for detailed step-by-step instructions!**

### Benefits:
- ✅ Free tier available
- ✅ No credit card needed
- ✅ Good for production
- ✅ Multiple models available

### Free Tier Limits:
- Generous free usage
- Rate limits apply (but usually enough for personal projects)

---

## Option 3: Test Mode (No AI, but works)

If you don't want to set up any AI, the system will use smart template-based responses:

```env
AI_PROVIDER=test
# or just don't set any provider
```

This uses the project details to generate responses - not as smart as AI, but still functional!

---

## Which Should You Choose?

- **Ollama**: Best for **local development**, completely free, works offline
  - ⚠️ **Not suitable for cloud deployment** (Railway, Render, etc.)
  - ✅ Perfect for running on your own computer
  
- **Hugging Face**: Best for **production/cloud deployment**, free tier available
  - ✅ Works on Railway, Render, Heroku, etc.
  - ✅ No local installation needed
  - ✅ API-based (perfect for containers)
  
- **Test Mode**: Works without any setup, but limited responses

**For cloud deployment (Railway/Render): Use Hugging Face!**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed cloud deployment instructions.

---

## Switching Between Providers

Just change the `AI_PROVIDER` in your `.env` file:
- `AI_PROVIDER=ollama` - Use Ollama
- `AI_PROVIDER=huggingface` - Use Hugging Face
- `AI_PROVIDER=openai` - Use OpenAI (if you have API key)
- `AI_PROVIDER=test` - Use test mode

The system will automatically use the configured provider!

---

## Troubleshooting

### Ollama not working?
- Make sure Ollama is running: Check `http://localhost:11434` in browser
- Make sure you've downloaded a model: `ollama pull llama3.2`
- Check the OLLAMA_URL in your .env matches your Ollama installation

### Hugging Face not working?
- Verify your API token is correct
- Check you have read access to the model
- Some models may be rate-limited on free tier

### Need help?
Check the backend logs - they'll show which provider is being used and any errors.

