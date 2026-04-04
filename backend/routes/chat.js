import express from 'express';
import {
  retrieveContextHybrid,
  getProjectRowByTitleCi,
  getAllProjectRows,
} from '../utils/retrieve.js';
import {
  resolveProjectDetailsKey,
  rankProjectsByKeywords,
} from '../utils/projectKeywordMatch.js';
import { isFollowUpQuestion } from '../utils/followUpContext.js';
import { formatRagContextChunks } from '../utils/formatRagContext.js';
import { pipeline } from '@xenova/transformers';
import { generateSmartResponse } from '../utils/smartResponse.js';
import { projectDetails } from '../data/projectDetails.js';
import {
  generateWithHuggingFace,
  generateWithOpenAI,
  getActiveProvider,
  SYSTEM_PROMPT,
  buildRagUserMessage,
} from '../utils/aiProviders.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const MAX_CONTEXT_PROJECTS = 5;
const NO_MATCH_LLM_MESSAGE = `I'm not sure I have anything in Syed's portfolio that matches that yet. Could you name a project or rephrase? For example: DAR, Bigg Boss – App Room, Learning with AR, Obliviate, Fruit-Slicer, Apna super bazaar, Healthease, or Party Room.`;

/**
 * Generate embedding using Xenova (local)
 */
async function generateEmbedding(text) {
  try {
    const extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate AI response using available AI providers
 * Tries: Hugging Face -> OpenAI (based on configuration)
 */
async function generateAIResponse(userMessage, systemPrompt) {
  const provider = getActiveProvider();
  
  // Try Hugging Face FIRST (best quality, free tier) - if API key configured
  if (provider === 'huggingface' || process.env.HUGGINGFACE_API_KEY) {
    try {
      const model = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
      console.log(`[AI] Trying Hugging Face with model: ${model}`);
      const response = await generateWithHuggingFace(userMessage, systemPrompt, model);
      console.log('🤖 AI IS WORKING - Using Hugging Face AI');
      return { response, provider: 'Hugging Face' };
    } catch (error) {
      console.log(`[AI] Hugging Face failed: ${error.message}, trying next provider...`);
    }
  }
  
  // Try OpenAI (if API key configured)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      console.log(`[AI] Trying OpenAI with model: ${model}`);
      const response = await generateWithOpenAI(userMessage, systemPrompt, model);
      console.log('🤖 AI IS WORKING - Using OpenAI');
      return { response, provider: 'OpenAI' };
    } catch (error) {
      console.log(`[AI] OpenAI failed: ${error.message}`);
    }
  }
  
  // All AI providers failed
  console.log('⚠️  ALL AI PROVIDERS FAILED - Will use hardcoded response');
  return null;
}

/**
 * POST /api/ask
 * RAG chat endpoint with smart fallback
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, lastProjectTitle } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const lastTitle =
      typeof lastProjectTitle === 'string' ? lastProjectTitle.trim().slice(0, 200) : '';

    console.log(`Processing question: "${question}"`);

    // Step 1: Generate embedding for the question using Xenova
    console.log('Generating query embedding with Xenova...');
    const queryEmbedding = await generateEmbedding(question);

    // Step 2: Retrieve relevant context from database
    // Lower threshold for better matching (especially for case variations)
    console.log('Retrieving relevant projects...');
    let relevantProjects = await retrieveContextHybrid(
      queryEmbedding,
      question,
      MAX_CONTEXT_PROJECTS,
      0.4
    );

    if (relevantProjects.length === 0 && lastTitle) {
      const allRows = await getAllProjectRows();
      const alt = rankProjectsByKeywords(question, allRows, 0.88);

      if (alt.length > 0) {
        relevantProjects = alt.slice(0, MAX_CONTEXT_PROJECTS);
        console.log('[Context] Strong keyword match recovered empty retrieval');
      } else if (isFollowUpQuestion(question)) {
        const row = await getProjectRowByTitleCi(lastTitle);
        if (row) {
          relevantProjects = [
            {
              id: row.id,
              title: row.title,
              description: row.description,
              links: row.links,
              similarity: 0.75,
            },
          ];
          console.log(
            `[Follow-up] Injected previous project context: "${row.title}"`
          );
        }
      }
    }

    console.log(`Found ${relevantProjects.length} relevant projects`);
    relevantProjects.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (similarity: ${p.similarity?.toFixed(3) || 'N/A'})`);
    });

    // Step 3: Build context and try AI providers
    let answer = null;
    
    // Check if user is asking for links
    const questionLower = question.toLowerCase();
    const userAsksForLink = /\b(link|github|repository|repo|code|source|where can i|how can i|show me|give me|provide|share|url|website)\b/.test(questionLower);
    
    if (userAsksForLink) {
      console.log('[Context] User asked for link - will include GitHub URLs');
    } else {
      console.log('[Context] User did not ask for link - GitHub URLs will be excluded');
    }
    
    const formattedContext =
      relevantProjects.length > 0
        ? formatRagContextChunks(relevantProjects, {
            projectDetails,
            resolveProjectDetailsKey,
            userAsksForLink,
            maxChunks: MAX_CONTEXT_PROJECTS,
          })
        : '';

    if (relevantProjects.length > 0) {
      relevantProjects.forEach((p) => {
        const mk = resolveProjectDetailsKey(p.title);
        console.log(
          `[Context] "${p.title}" -> projectDetails: ${mk ? `"${mk}"` : 'none'}`
        );
      });
    }

    let aiResult = null;

    if (relevantProjects.length === 0) {
      console.log(
        '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⏭️  Skipping LLM — no retrieved projects; using default guidance.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
      );
    } else {
      const userMessage = buildRagUserMessage(question, formattedContext);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 Attempting to use AI providers...');
      aiResult = await generateAIResponse(userMessage, SYSTEM_PROMPT);
    }

    // Step 4: If all AI providers failed, use smartResponse fallback
    let aiUsed = false;
    let aiProvider = null;
    
    if (relevantProjects.length === 0) {
      answer = `${NO_MATCH_LLM_MESSAGE}\n\nFor more information, please contact Syed Bakhtawar Abbas or visit the contact page.`;
      aiUsed = false;
      aiProvider = null;
    } else if (aiResult && aiResult.response) {
      // AI is working!
      answer = aiResult.response;
      aiUsed = true;
      aiProvider = aiResult.provider;
      console.log(`✅ Response generated using ${aiResult.provider}`);

      const noProjectsFound = false;
      
      // Check if answer indicates missing/unavailable information (comprehensive patterns)
      const missingInfoPatterns = [
        /\bnot sure\b/i,
        /\bdon't have that\b/i,
        /not available/i,
        /not in the portfolio/i,
        /cannot find/i,
        /don't have/i,
        /doesn't have/i,
        /i don't have/i,
        /i'm not able/i,
        /i am not able/i,
        /unable to/i,
        /cannot provide/i,
        /not provided/i,
        /no information/i,
        /could not find/i,
        /couldn't find/i,
        /don't have access/i,
        /not appropriate to share/i,
        /cannot provide you/i,
        /i'm sorry.*cannot/i,
        /i cannot/i,
        /i'm not able to provide/i,
        /do not have/i,
        /don't have access to/i,
        /i don't have access/i,
        /do not have access/i,
        /just an ai/i,
        /i'm just an ai/i,
        /i am just an ai/i
      ];
      
      const hasMissingInfo = missingInfoPatterns.some(pattern => pattern.test(answer));
      
      // Check if contact message already exists (more flexible check)
      const hasContactMessage = /contact syed bakhtawar|contact page|contact person|contact.*abbas/i.test(answer);
      
      // Add contact message if:
      // 1. No projects found (always add)
      // 2. Missing info detected and contact message not already present
      const contactLine =
        '\n\nFor more information, please contact Syed Bakhtawar Abbas or visit the contact page.';
      const alreadyHasFooter =
        hasContactMessage ||
        /contact syed bakhtawar|visit the contact page/i.test(answer);
      if (
        (noProjectsFound || (hasMissingInfo && !alreadyHasFooter)) &&
        !alreadyHasFooter
      ) {
        answer += contactLine;
        console.log('[Response] Added contact message - Missing info:', hasMissingInfo, 'No projects:', noProjectsFound);
      } else if (!alreadyHasFooter) {
        const fallbackPatterns = [
          /i'm not able/i,
          /i am not able/i,
          /don't have access/i,
          /do not have access/i,
          /just an ai/i,
          /i'm just an ai/i,
          /i am just an ai/i,
          /cannot provide/i,
          /do not have/i,
        ];
        if (fallbackPatterns.some((p) => p.test(answer))) {
          answer += contactLine;
          console.log('[Response] Added contact message via fallback pattern');
        }
      }
    } else {
      // LLM unavailable but we have retrieved projects
      console.log('⚠️  USING HARDCODED RESPONSE (smartResponse.js)');
      const topProject = relevantProjects[0];
      answer = await generateSmartResponse(question, topProject, relevantProjects);
      if (!answer.includes('contact') && !answer.includes('Syed Bakhtawar Abbas')) {
        answer += "\n\nFor more information, please contact Syed Bakhtawar Abbas or visit the contact page.";
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({
      answer,
      aiUsed,
      aiProvider,
      relevantProjects: relevantProjects.map((p) => ({
        title: p.title,
        description: p.description,
        links: p.links,
      })),
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    
    // Always return a response, never throw
    res.status(500).json({
      error: 'Failed to process question',
      message: error.message,
      answer: "I'm having trouble processing your question right now. Please try asking about one of my projects like DAR, Learning with AR, or Obliviate.\n\nFor more information, please contact Syed Bakhtawar Abbas or visit the contact page.",
    });
  }
});

export default router;
