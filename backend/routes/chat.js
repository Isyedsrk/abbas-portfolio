import express from 'express';
import {
  retrieveContextHybrid,
  getProjectRowByTitleCi,
  getAllProjectRows,
} from '../utils/retrieve.js';
import {
  resolveProjectDetailsKey,
  rankProjectsByKeywords,
  prioritizeProjectsForQuery,
} from '../utils/projectKeywordMatch.js';
import {
  isFollowUpQuestion,
  isPortfolioWideComparisonQuestion,
} from '../utils/followUpContext.js';
import { isGenericUnscopedTechQuestion } from '../utils/ambiguousFollowUp.js';
import { formatRagContextChunks } from '../utils/formatRagContext.js';
import {
  buildPortfolioTimelineBlock,
  isLatestProjectQuery,
  parseRecencyOrdinalIndex,
  buildOrdinalTimelineAnswer,
  orderProjectTitlesByRecency,
  sortRetrievedProjectsByTimeline,
  sortTitleStringsByTimeline,
  isTeamOrCompositionQuery,
  buildTeamCompositionHint,
  isRelativeTimelineOlderQuery,
  resolveNextOlderTitleFromAnchor,
  buildTimelineOlderStepAnswer,
  sliceAssistantForTimelineAnchor,
  pickTimelineWalkAnchorFromSlice,
} from '../utils/portfolioTimeline.js';
import {
  isTechExistenceQuestion,
  buildTechGroundingBlock,
  mergeTechGroundedProjects,
  isPythonPresencePortfolioQuestion,
  buildPythonPresenceStaticAnswer,
} from '../utils/techGrounding.js';
import {
  buildConsistencyGroundingPreamble,
} from '../utils/conversationConsistency.js';
import { pipeline } from '@xenova/transformers';
import {
  generateSmartResponse,
  userWantsLinkDemoOrGlimpse,
} from '../utils/smartResponse.js';
import { projectDetails } from '../data/projectDetails.js';
import {
  generateWithHuggingFace,
  generateWithOpenAI,
  generateWithOllama,
} from '../utils/aiProviders.js';
import {
  SYSTEM_PROMPT,
  buildRagUserMessage,
  buildNoMatchPortfolioContext,
  normalizeConversationHistory,
} from '../config/llmPrompt.js';
import dotenv from 'dotenv';
import {
  isGreeting,
  isVaguePortfolioQuestion,
  buildVaguePortfolioAnswer,
  GREETING_ASSISTANT_ANSWER,
  SOFT_UNCLEAR_ASSISTANT_ANSWER,
} from '../utils/conversationGuidance.js';
import {
  isConversationClosing,
  CLOSING_ASSISTANT_ANSWER,
} from '../utils/conversationClosing.js';
import { saveChatExchange, resolveChatSessionId } from '../utils/chatStore.js';
import { polishAssistantReply } from '../utils/humanizeResponse.js';

dotenv.config();

const router = express.Router();

const MAX_CONTEXT_PROJECTS = 5;

function logChatResponseSource(source) {
  console.log(`[Chat] Response source: ${source}`);
}

async function moveLastTitleToFront(projects, lastTitle, max) {
  const lt = String(lastTitle || '').trim();
  if (!lt) return projects;
  const low = lt.toLowerCase();
  const idx = projects.findIndex(
    (p) => String(p.title || '').trim().toLowerCase() === low
  );
  if (idx === 0) return projects.slice(0, max);
  if (idx > 0) {
    const copy = [...projects];
    const [x] = copy.splice(idx, 1);
    return [x, ...copy].slice(0, max);
  }
  const row = await getProjectRowByTitleCi(lt);
  if (!row) return projects.slice(0, max);
  const rest = projects.filter(
    (p) => String(p.title || '').trim().toLowerCase() !== low
  );
  return [
    {
      id: row.id,
      title: row.title,
      description: row.description,
      links: row.links,
      similarity: 0.94,
    },
    ...rest,
  ].slice(0, max);
}

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

function cloudLlmConfigured() {
  const hf =
    typeof process.env.HUGGINGFACE_API_KEY === 'string' &&
    process.env.HUGGINGFACE_API_KEY.startsWith('hf_');
  const oai =
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  return hf || oai;
}

/**
 * Generate AI response using available AI providers
 * Order: optional Ollama-first → Hugging Face → OpenAI → Ollama fallback (local / opt-in)
 */
async function generateAIResponse(userMessage, systemPrompt) {
  const configured = cloudLlmConfigured();
  const preferOllama = process.env.AI_PROVIDER === 'ollama';
  const ollamaFallback =
    process.env.OLLAMA_FALLBACK === '1' || process.env.OLLAMA_FALLBACK === 'true';

  const tryOllama = async () => {
    const model = process.env.OLLAMA_MODEL || null;
    const response = await generateWithOllama(userMessage, systemPrompt, model);
    console.log('🤖 AI IS WORKING - Using Ollama (local)');
    return { response, provider: 'Ollama (local)' };
  };

  if (preferOllama) {
    try {
      return await tryOllama();
    } catch (error) {
      console.log(`[AI] Ollama (preferred) failed: ${error.message}, trying cloud...`);
    }
  }

  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (
    typeof hfKey === 'string' &&
    hfKey.trim() &&
    hfKey !== 'your_token_here'
  ) {
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

  if (!preferOllama && (ollamaFallback || !configured)) {
    try {
      return await tryOllama();
    } catch (error) {
      console.log(`[AI] Ollama fallback failed: ${error.message}`);
    }
  }

  console.log('⚠️  ALL AI PROVIDERS FAILED - Will use hardcoded response');
  return null;
}

/**
 * POST /api/ask
 * RAG chat endpoint with smart fallback
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, lastProjectTitle, history: rawHistory, sessionId: rawSessionId } =
      req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const sessionId = resolveChatSessionId(rawSessionId);

    const conversationHistory = normalizeConversationHistory(rawHistory);

    const lastTitle =
      typeof lastProjectTitle === 'string' ? lastProjectTitle.trim().slice(0, 200) : '';

    console.log(`Processing question: "${question}"`);

    const portfolioWideCompare = isPortfolioWideComparisonQuestion(question);

    /** Short sign-offs — skip RAG/LLM so we don’t get generic “Hello / be more specific” noise */
    if (isConversationClosing(question)) {
      const responseSource = 'static template (closing)';
      logChatResponseSource(responseSource);
      const answer = CLOSING_ASSISTANT_ANSWER;
      try {
        await saveChatExchange({
          sessionId,
          userContent: question,
          assistantContent: answer,
          responseSource,
          aiUsed: false,
          aiProvider: null,
          relevantProjects: [],
        });
      } catch (e) {
        console.error('[Chat] Failed to save messages:', e.message);
      }
      return res.json({
        answer,
        aiUsed: false,
        aiProvider: null,
        responseSource,
        sessionId,
        relevantProjects: [],
      });
    }

    /** Bare “hi” / “hello” — always short; never send long project lists */
    if (isGreeting(question)) {
      const responseSource = 'static template (greeting)';
      logChatResponseSource(responseSource);
      const answer = GREETING_ASSISTANT_ANSWER;
      try {
        await saveChatExchange({
          sessionId,
          userContent: question,
          assistantContent: answer,
          responseSource,
          aiUsed: false,
          aiProvider: null,
          relevantProjects: [],
        });
      } catch (e) {
        console.error('[Chat] Failed to save messages:', e.message);
      }
      return res.json({
        answer,
        aiUsed: false,
        aiProvider: null,
        responseSource,
        sessionId,
        relevantProjects: [],
      });
    }

    if (isPythonPresencePortfolioQuestion(question)) {
      const py = buildPythonPresenceStaticAnswer(projectDetails);
      if (py) {
        const responseSource = 'static template (python presence)';
        logChatResponseSource(responseSource);
        const focusTitle = py.focusTitle;
        let relevantProjectsOut = [];
        if (focusTitle) {
          const row = await getProjectRowByTitleCi(focusTitle);
          if (row) {
            relevantProjectsOut = [
              { title: row.title, description: row.description, links: row.links },
            ];
          } else {
            relevantProjectsOut = [{ title: focusTitle, description: '', links: '' }];
          }
        }
        try {
          await saveChatExchange({
            sessionId,
            userContent: question,
            assistantContent: py.answer,
            responseSource,
            aiUsed: false,
            aiProvider: null,
            relevantProjects: relevantProjectsOut,
          });
        } catch (e) {
          console.error('[Chat] Failed to save messages:', e.message);
        }
        return res.json({
          answer: py.answer,
          aiUsed: false,
          aiProvider: null,
          responseSource,
          sessionId,
          relevantProjects: relevantProjectsOut,
        });
      }
    }

    if (isRelativeTimelineOlderQuery(question) && conversationHistory.length > 0) {
      const ordered = orderProjectTitlesByRecency(projectDetails);
      let anchor = null;
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        if (conversationHistory[i].role !== 'assistant') continue;
        const c = sliceAssistantForTimelineAnchor(
          String(conversationHistory[i].content || '')
        );
        const fromAssistant = pickTimelineWalkAnchorFromSlice(c, ordered);
        if (fromAssistant) {
          anchor = fromAssistant;
          break;
        }
      }
      if (!anchor && lastTitle) {
        const row = await getProjectRowByTitleCi(lastTitle);
        if (row?.title) {
          anchor =
            ordered.find((x) => x.toLowerCase() === row.title.toLowerCase()) ||
            ordered.find((x) =>
              row.title.toLowerCase().includes(x.toLowerCase().split('(')[0].trim())
            );
        }
      }
      if (!anchor) anchor = ordered[0] || 'Party Room';

      const { older, anchor: anch, atEnd } = resolveNextOlderTitleFromAnchor(
        projectDetails,
        anchor
      );
      const walkAnswer = buildTimelineOlderStepAnswer(older, anch, atEnd);
      const responseSource = 'static template (timeline walk)';
      logChatResponseSource(responseSource);
      const focusTitle = older || anch;
      let relevantProjectsOut = [];
      if (focusTitle) {
        const row = await getProjectRowByTitleCi(focusTitle);
        if (row) {
          relevantProjectsOut = [
            { title: row.title, description: row.description, links: row.links },
          ];
        } else {
          relevantProjectsOut = [{ title: focusTitle, description: '', links: '' }];
        }
      }
      try {
        await saveChatExchange({
          sessionId,
          userContent: question,
          assistantContent: walkAnswer,
          responseSource,
          aiUsed: false,
          aiProvider: null,
          relevantProjects: relevantProjectsOut,
        });
      } catch (e) {
        console.error('[Chat] Failed to save messages:', e.message);
      }
      return res.json({
        answer: walkAnswer,
        aiUsed: false,
        aiProvider: null,
        responseSource,
        sessionId,
        relevantProjects: relevantProjectsOut,
      });
    }

    const ordinalIdx = parseRecencyOrdinalIndex(question);
    if (ordinalIdx != null) {
      const ordinalAnswer = buildOrdinalTimelineAnswer(projectDetails, ordinalIdx);
      if (ordinalAnswer) {
        const responseSource = 'static template (timeline ordinal)';
        logChatResponseSource(responseSource);
        const pickedTitle = orderProjectTitlesByRecency(projectDetails)[ordinalIdx];
        let relevantProjectsOut = [];
        if (pickedTitle) {
          const row = await getProjectRowByTitleCi(pickedTitle);
          if (row) {
            relevantProjectsOut = [
              { title: row.title, description: row.description, links: row.links },
            ];
          } else {
            relevantProjectsOut = [{ title: pickedTitle, description: '', links: '' }];
          }
        }
        try {
          await saveChatExchange({
            sessionId,
            userContent: question,
            assistantContent: ordinalAnswer,
            responseSource,
            aiUsed: false,
            aiProvider: null,
            relevantProjects: relevantProjectsOut,
          });
        } catch (e) {
          console.error('[Chat] Failed to save messages:', e.message);
        }
        return res.json({
          answer: ordinalAnswer,
          aiUsed: false,
          aiProvider: null,
          responseSource,
          sessionId,
          relevantProjects: relevantProjectsOut,
        });
      }
    }

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

    let allRowsCache = null;
    if (relevantProjects.length === 0) {
      allRowsCache = await getAllProjectRows();
      const altWide = rankProjectsByKeywords(question, allRowsCache, 0.78);

      if (altWide.length > 0) {
        relevantProjects = altWide.slice(0, MAX_CONTEXT_PROJECTS);
        console.log('[Context] Keyword match recovered empty retrieval (wide)');
      } else if (lastTitle) {
        const alt = rankProjectsByKeywords(question, allRowsCache, 0.88);

        if (alt.length > 0) {
          relevantProjects = alt.slice(0, MAX_CONTEXT_PROJECTS);
          console.log('[Context] Strong keyword match recovered empty retrieval');
        } else if (
          lastTitle &&
          isFollowUpQuestion(question) &&
          !portfolioWideCompare
        ) {
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
    }

    if (isTechExistenceQuestion(question)) {
      if (!allRowsCache) allRowsCache = await getAllProjectRows();
      relevantProjects = mergeTechGroundedProjects(
        relevantProjects,
        projectDetails,
        allRowsCache,
        question,
        MAX_CONTEXT_PROJECTS
      );
    }

    if (portfolioWideCompare) {
      console.log(
        '[Context] Portfolio-wide comparison — not locking to last thread project'
      );
    }

    console.log(`Found ${relevantProjects.length} relevant projects`);
    relevantProjects.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (similarity: ${p.similarity?.toFixed(3) || 'N/A'})`);
    });

    relevantProjects = prioritizeProjectsForQuery(
      question,
      relevantProjects,
      projectDetails,
      resolveProjectDetailsKey
    );

    relevantProjects = sortRetrievedProjectsByTimeline(
      relevantProjects,
      resolveProjectDetailsKey
    );

    const genericUnscopedTech = isGenericUnscopedTechQuestion(question);

    const threadFollowUp = Boolean(
      lastTitle &&
        isFollowUpQuestion(question) &&
        !portfolioWideCompare &&
        !genericUnscopedTech
    );
    if (threadFollowUp) {
      relevantProjects = await moveLastTitleToFront(
        relevantProjects,
        lastTitle,
        MAX_CONTEXT_PROJECTS
      );
      console.log(`[Follow-up] Prioritized active project from thread: "${lastTitle}"`);
    }

    if (!threadFollowUp && isLatestProjectQuery(question)) {
      const hasParty = relevantProjects.some((p) =>
        /party\s*room/i.test(String(p.title || ''))
      );
      if (!hasParty) {
        const row = await getProjectRowByTitleCi('Party Room');
        if (row) {
          relevantProjects = [
            {
              id: row.id,
              title: row.title,
              description: row.description,
              links: row.links,
              similarity: 0.92,
            },
            ...relevantProjects,
          ].slice(0, MAX_CONTEXT_PROJECTS);
          console.log(
            '[Context] Injected Party Room for latest/most-recent style query'
          );
        }
      }
    }

    // Step 3: Build context and try AI providers
    let answer = null;
    
    const questionLower = question.toLowerCase();
    const steerToProjectsPageForLinks = userWantsLinkDemoOrGlimpse(questionLower);
    const userAsksForLink =
      !steerToProjectsPageForLinks &&
      /\b(link|github|repository|repo|code|source|where can i|how can i|show me|give me|provide|share|url|website)\b/.test(
        questionLower
      );

    if (steerToProjectsPageForLinks) {
      console.log(
        '[Context] Link/demo/glimpse intent — steering to Projects page (View/Glimpse); repo URLs omitted from chunks'
      );
    } else if (userAsksForLink) {
      console.log('[Context] User asked for link - will include GitHub URLs');
    } else {
      console.log('[Context] User did not ask for link - GitHub URLs will be excluded');
    }
    
    const rowsForNoMatch =
      allRowsCache ?? (relevantProjects.length === 0 ? await getAllProjectRows() : null);

    const timelineBlock = buildPortfolioTimelineBlock(projectDetails);
    const techExist = isTechExistenceQuestion(question);
    const consistencyPreamble = buildConsistencyGroundingPreamble(projectDetails, question, {
      techExistence: techExist,
    });
    const techGroundBlock = techExist ? buildTechGroundingBlock(projectDetails, question) : '';
    const extraGroundingPrefix =
      consistencyPreamble || techGroundBlock
        ? `${consistencyPreamble ? `${consistencyPreamble}\n\n---\n\n` : ''}${
            techGroundBlock ? `${techGroundBlock}\n\n---\n\n` : ''
          }`
        : '';

    const ragBody =
      relevantProjects.length > 0
        ? formatRagContextChunks(relevantProjects, {
            projectDetails,
            resolveProjectDetailsKey,
            userAsksForLink,
            maxChunks: MAX_CONTEXT_PROJECTS,
          })
        : buildNoMatchPortfolioContext(
            sortTitleStringsByTimeline(
              (rowsForNoMatch || []).map((r) => r.title).filter(Boolean),
              resolveProjectDetailsKey
            )
          );
    const portfolioLinkHint = steerToProjectsPageForLinks
      ? 'VISITOR INTENT: They want a repo, demo, or video peek. Answer in first person, naturally — repos and quick previews sit with each project on your portfolio showcase. Do not give step-by-step UI instructions (no "click this tab"). Do not claim anything is private or secret.\n\n---\n\n'
      : '';

    const teamCompositionHint = isTeamOrCompositionQuery(question)
      ? `${buildTeamCompositionHint(projectDetails)}\n\n---\n\n`
      : '';

    const unscopedTechNote = genericUnscopedTech
      ? 'UNSCOPED TECH QUESTION: The user did not name a project (not a follow-up scoped to one build). Do **not** assume Party Room or the first Project block. In ### Quick answer either ask which project to cover, or say briefly that stacks differ by project and ask which they want.\n\n---\n\n'
      : '';

    const formattedContext = `${timelineBlock}\n\n---\n\n${unscopedTechNote}${extraGroundingPrefix}${teamCompositionHint}${portfolioLinkHint}${ragBody}`;

    if (relevantProjects.length > 0) {
      relevantProjects.forEach((p) => {
        const mk = resolveProjectDetailsKey(p.title);
        console.log(
          `[Context] "${p.title}" -> projectDetails: ${mk ? `"${mk}"` : 'none'}`
        );
      });
    } else {
      console.log('[Context] No retrieved rows — LLM still runs with portfolio title index');
    }

    const userMessage = buildRagUserMessage(
      question,
      formattedContext,
      conversationHistory,
      genericUnscopedTech ? null : lastTitle || null
    );

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Attempting to use AI providers (all questions)...');
    const aiResult = await generateAIResponse(userMessage, SYSTEM_PROMPT);

    // Step 4: Prefer LLM; smartResponse / static only if every provider failed
    let aiUsed = false;
    let aiProvider = null;
    let responseSource = '';

    if (aiResult && aiResult.response) {
      answer = polishAssistantReply(aiResult.response, {
        hasPriorTurns: conversationHistory.length > 0,
        question,
      });
      aiUsed = true;
      aiProvider = aiResult.provider;
      console.log(`✅ Response generated using ${aiResult.provider}`);
      responseSource = aiResult.provider;
      logChatResponseSource(responseSource);

      // Do not append generic contact/footer text to normal replies — it breaks flow and misfires on broad patterns.
    } else {
      console.log('⚠️  ALL LLM PROVIDERS FAILED — last-resort template fallback');
      if (relevantProjects.length > 0) {
        responseSource = 'smart response (smartResponse.js — no LLM)';
        logChatResponseSource(responseSource);
        const topProject = relevantProjects[0];
        answer = await generateSmartResponse(question, topProject, relevantProjects);
      } else if (isVaguePortfolioQuestion(question)) {
        const rowsForList = await getAllProjectRows();
        answer = buildVaguePortfolioAnswer(rowsForList);
        responseSource = 'static template (fallback — no LLM, vague list)';
        logChatResponseSource(responseSource);
      } else {
        answer = SOFT_UNCLEAR_ASSISTANT_ANSWER;
        responseSource = 'static template (fallback — no LLM)';
        logChatResponseSource(responseSource);
      }
      aiUsed = false;
      aiProvider = null;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const relevantProjectsOut = relevantProjects.map((p) => ({
      title: p.title,
      description: p.description,
      links: p.links,
    }));

    try {
      await saveChatExchange({
        sessionId,
        userContent: question,
        assistantContent: answer,
        responseSource,
        aiUsed,
        aiProvider,
        relevantProjects: relevantProjectsOut,
      });
    } catch (persistErr) {
      console.error('[Chat] Failed to save messages:', persistErr.message);
    }

    res.json({
      answer,
      aiUsed,
      aiProvider,
      responseSource,
      sessionId,
      relevantProjects: relevantProjectsOut,
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    const responseSource = 'error — server fallback message';
    logChatResponseSource(responseSource);

    // Always return a response, never throw
    res.status(500).json({
      error: 'Failed to process question',
      message: error.message,
      responseSource,
      answer:
        "I'm having trouble processing your question right now. Please try asking about one of my projects like DAR, Learning with AR, or Obliviate.\n\nFor more information, use **Contact** in the site menu to scroll to the footer for phone and email.",
    });
  }
});

export default router;
