import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';
import { getActiveProvider } from './utils/aiProviders.js';
import { ensureChatTables } from './utils/chatStore.js';
import { buildCorsOptions } from './utils/corsConfig.js';

dotenv.config();

ensureChatTables().catch((e) =>
  console.error('[Chat] Could not init chat tables:', e.message)
);

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = buildCorsOptions();

// Middleware — must run before routes so OPTIONS preflight gets CORS headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Show AI provider status
  const provider = getActiveProvider();
  console.log('\n📊 AI Provider Status:');
  if (provider === 'huggingface') {
    console.log('  🤖 Hugging Face: ✅ CONFIGURED (Best Quality - Free Tier)');
    console.log(`     Model: ${process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2'}`);
    console.log('     💡 Free tier: 1,000 requests/day - Perfect for portfolio!');
    console.log('     ✅ Using best free AI models available!');
  } else if (provider === 'openai') {
    console.log('  🤖 OpenAI: ✅ CONFIGURED');
    console.log(`     Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
  } else {
    console.log('  ⚠️  No AI provider configured - Using hardcoded responses');
    console.log('  💡 RECOMMENDED: Set up Hugging Face for best free AI quality!');
    console.log('     See BEST_FREE_AI_GUIDE.md for 5-minute setup guide.');
    console.log('     🔗 Sign up: https://huggingface.co/join');
    console.log('     🔗 Get token: https://huggingface.co/settings/tokens');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

