# Hugging Face API Integration - Step by Step Guide

## Step 1: Create a Hugging Face Account

1. Go to **https://huggingface.co**
2. Click **"Sign Up"** in the top right corner
3. Choose one of these sign-up methods:
   - Sign up with Google
   - Sign up with GitHub (recommended if you use GitHub)
   - Sign up with email
4. Complete the registration process
5. Verify your email if required

**✅ You now have a free Hugging Face account!**

---

## Step 2: Generate Your API Token

1. **Log in** to your Hugging Face account
2. Click on your **profile picture** (top right corner)
3. Select **"Settings"** from the dropdown menu
4. In the left sidebar, click **"Access Tokens"**
   - Or go directly to: **https://huggingface.co/settings/tokens**
5. Click the **"New token"** button
6. Fill in the token details:
   - **Token name**: `portfolio-chat-api` (or any name you prefer)
   - **Type**: Select **"Read"** (this is enough for our use case)
   - **Description** (optional): "For portfolio chat backend"
7. Click **"Generate token"**
8. **⚠️ IMPORTANT**: Copy the token immediately!
   - It will look like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again after closing the page
   - Save it somewhere safe (password manager, notes, etc.)

**✅ You now have your Hugging Face API token!**

---

## Step 3: Add Token to Your Backend

### Option A: Using .env File (Local Development)

1. Open your backend folder: `E:\abbas\backend`
2. Open or create the `.env` file
3. Add these lines:
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PORT=3000
   ```
4. Replace `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual token
5. Save the file

**Example .env file:**
```env
# AI Provider Configuration
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_abc123xyz789your_actual_token_here

# Server Configuration
PORT=3000
DB_PATH=./db/projects.db
```

### Option B: Using Environment Variables (Cloud Deployment)

**For Railway:**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. Click **"New Variable"**
5. Add:
   - **Name**: `AI_PROVIDER`
   - **Value**: `huggingface`
6. Click **"New Variable"** again
7. Add:
   - **Name**: `HUGGINGFACE_API_KEY`
   - **Value**: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (your token)
8. Save

**For Render:**
1. Go to your Render dashboard
2. Select your service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key**: `AI_PROVIDER`
   - **Value**: `huggingface`
6. Click **"Add Environment Variable"** again
7. Add:
   - **Key**: `HUGGINGFACE_API_KEY`
   - **Value**: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (your token)
8. Save

---

## Step 4: Verify Your Setup

1. **Check your .env file** (or environment variables) contains:
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=your_token_here
   ```

2. **Restart your backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **Check the console output:**
   - You should see: `Using Hugging Face (free tier)...` when making requests
   - No errors about missing API keys

---

## Step 5: Test the Integration

1. **Start your backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Test with a request:**
   - Open your frontend chat
   - Ask a question like: "Tell me about DAR"
   - You should get an AI-generated response

3. **Check backend logs:**
   - Look for: `Using Hugging Face (free tier)...`
   - No error messages

---

## Troubleshooting

### ❌ Error: "Hugging Face API key not configured"

**Solution:**
- Make sure `HUGGINGFACE_API_KEY` is set in your `.env` file
- Restart your server after adding the token
- Check for typos in the token

### ❌ Error: "Hugging Face API error: 401"

**Solution:**
- Your token might be invalid or expired
- Generate a new token from Hugging Face settings
- Make sure you copied the full token (starts with `hf_`)

### ❌ Error: "Hugging Face API error: 429" (Rate Limit)

**Solution:**
- You've hit the free tier rate limit
- Wait a few minutes and try again
- Free tier has generous limits, this is rare

### ❌ Error: "Model not found" or "Model loading"

**Solution:**
- Some models need to be loaded first (takes 30-60 seconds)
- Wait and try again
- The model will be cached after first use

### ❌ Backend still using test mode

**Solution:**
- Check `AI_PROVIDER=huggingface` is set correctly
- Make sure `HUGGINGFACE_API_KEY` is set
- Restart your server
- Check console logs to see which provider is active

---

## Security Best Practices

1. **Never commit your .env file to Git**
   - Make sure `.env` is in your `.gitignore`
   - Your token should be private

2. **Use environment variables in production**
   - Don't hardcode tokens in your code
   - Use platform environment variables (Railway, Render, etc.)

3. **Rotate tokens if compromised**
   - If you suspect your token is leaked, generate a new one
   - Delete the old token from Hugging Face settings

4. **Use "Read" token type**
   - For this use case, "Read" access is enough
   - Don't use "Write" tokens unless necessary

---

## Quick Checklist

- [ ] Hugging Face account created
- [ ] API token generated
- [ ] Token copied and saved securely
- [ ] `.env` file updated with `AI_PROVIDER=huggingface`
- [ ] `.env` file updated with `HUGGINGFACE_API_KEY=your_token`
- [ ] Backend server restarted
- [ ] Tested with a chat question
- [ ] Verified logs show "Using Hugging Face"

---

## What Happens Next?

Once configured, your backend will:
1. ✅ Use Hugging Face for AI responses (free tier)
2. ✅ Generate embeddings using Hugging Face models
3. ✅ Provide intelligent, conversational responses
4. ✅ Work on both local and cloud deployments

**You're all set! Your portfolio chat now uses free AI forever! 🎉**

---

## Need Help?

- Hugging Face Docs: https://huggingface.co/docs
- Hugging Face Community: https://huggingface.co/community
- Check backend logs for detailed error messages

