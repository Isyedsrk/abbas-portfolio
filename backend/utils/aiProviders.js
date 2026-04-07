/**
 * Free AI Providers for chat responses
 * Supports: Ollama (local, free), Hugging Face (free tier)
 */

export { SYSTEM_PROMPT, buildRagUserMessage } from '../config/llmPrompt.js';

/** Sampling for chat completions — tune via LLM_TEMPERATURE / LLM_TOP_P in .env */
export function getLlmSamplingParams() {
  const t = parseFloat(process.env.LLM_TEMPERATURE ?? '');
  const temperature = Number.isFinite(t)
    ? Math.min(2, Math.max(0, t))
    : 0.75;
  const p = parseFloat(process.env.LLM_TOP_P ?? '');
  const top_p = Number.isFinite(p)
    ? Math.min(1, Math.max(0.01, p))
    : 0.92;
  return { temperature, top_p };
}

/**
 * Generate chat response using Ollama (local, completely free)
 */
export async function generateWithOllama(prompt, systemPrompt, model = null) {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  // Get available models if not specified
  let modelToUse = model;
  if (!modelToUse) {
    try {
      const modelsResponse = await fetch(`${ollamaUrl}/api/tags`);
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        if (modelsData.models && modelsData.models.length > 0) {
          modelToUse = modelsData.models[0].name;
          console.log(`[AI] Auto-detected Ollama model: ${modelToUse}`);
        }
      }
    } catch (e) {
      console.log(`[AI] Could not auto-detect models, using fallback`);
    }
  }
  
  // Fallback models to try (codellama:latest first since it's commonly available)
  const modelsToTry = modelToUse 
    ? [modelToUse] 
    : ['codellama:latest', 'llama3.2', 'llama3', 'mistral', 'phi3', 'llama2'];
  
  for (const tryModel of modelsToTry) {
    try {
      console.log(`[AI] Attempting Ollama model: ${tryModel}`);
      const { temperature, top_p } = getLlmSamplingParams();
      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: tryModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: false,
          options: { temperature, top_p },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.log(`[AI] Model ${tryModel} failed: ${response.status} ${response.statusText}`);
        if (tryModel === modelsToTry[modelsToTry.length - 1]) {
          throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
        }
        continue; // Try next model
      }

      const data = await response.json();
      const result = data.message?.content || data.response || 'Sorry, I could not generate a response.';
      console.log(`[AI] ✅ Successfully used Ollama model: ${tryModel}`);
      return result;
    } catch (error) {
      console.log(`[AI] Model ${tryModel} error: ${error.message}`);
      if (tryModel === modelsToTry[modelsToTry.length - 1]) {
        throw error;
      }
      continue; // Try next model
    }
  }
  
  throw new Error('No Ollama models available');
}

/**
 * Generate chat response using Hugging Face Inference API (free tier)
 */
export async function generateWithHuggingFace(prompt, systemPrompt, model = 'mistralai/Mistral-7B-Instruct-v0.2') {
  const { temperature, top_p } = getLlmSamplingParams();
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }
  
  // Validate API key format
  if (!apiKey.startsWith('hf_')) {
    console.log('[AI] ⚠️ Warning: Hugging Face API key should start with "hf_"');
  }
  
  console.log(`[AI] Using Hugging Face API key: ${apiKey.substring(0, 7)}...`);

  // Try better, more capable models first (free tier compatible)
  // Use chat completion endpoint (OpenAI-compatible format) for better results
  const models = [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'meta-llama/Llama-3.1-8B-Instruct',
    'meta-llama/Llama-3-8B-Instruct',
    'Qwen/Qwen2.5-7B-Instruct',
    'google/gemma-7b-it',
    'meta-llama/Llama-3.2-1B-Instruct',
  ];
  
  // Try different models using OpenAI-compatible chat completion endpoint
  for (const tryModel of models) {
    try {
      console.log(`[AI] Attempting Hugging Face model: ${tryModel}`);
      
      // Use router.huggingface.co/v1/chat/completions (OpenAI-compatible format)
      const endpoint = `https://router.huggingface.co/v1/chat/completions`;
      
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: tryModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature,
          top_p,
          stream: false,
        }),
      });
      
      // Handle 503 (model loading)
      if (response.status === 503) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '30');
        console.log(`[AI] Model ${tryModel} is loading, waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        // Retry with same endpoint and format
        const retryResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: tryModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            max_tokens: 500,
            temperature,
            top_p,
            stream: false,
          }),
        });
        
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          // OpenAI-compatible format: data.choices[0].message.content
          if (data.choices && data.choices[0] && data.choices[0].message) {
            const result = data.choices[0].message.content.trim();
            console.log(`[AI] ✅ Successfully used Hugging Face model: ${tryModel}`);
            return result;
          }
        }
        continue; // Try next model
      }
      
      if (response.ok) {
        const data = await response.json();
        // OpenAI-compatible format: data.choices[0].message.content
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const result = data.choices[0].message.content.trim();
          console.log(`[AI] ✅ Successfully used Hugging Face model: ${tryModel}`);
          return result;
        }
        // Fallback extraction
        const result = extractChatResponse(data);
        console.log(`[AI] ✅ Successfully used Hugging Face model: ${tryModel}`);
        return result;
      }
      
      // Get error details for debugging
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.log(`[AI] Model ${tryModel} failed: ${response.status} ${response.statusText}`);
      if (errorText && errorText.length > 0) {
        const errorPreview = errorText.length > 300 ? errorText.substring(0, 300) + '...' : errorText;
        console.log(`[AI] Error details: ${errorPreview}`);
      }
      
      // If 404 or other error, try next model
      if (response.status === 404 || response.status === 410) {
        continue;
      }
      
      // If authentication error, don't try other models
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Hugging Face API authentication failed (${response.status}). Please check your HUGGINGFACE_API_KEY in .env file.`);
      }
      
    } catch (err) {
      console.log(`[AI] Model ${tryModel} error: ${err.message}`);
      // If it's an auth error, throw it immediately
      if (err.message.includes('authentication')) {
        throw err;
      }
      continue; // Try next model
    }
  }
  
  throw new Error('All Hugging Face models failed - using fallback responses');
}

/**
 * Extract chat response from Hugging Face API response
 */
function extractChatResponse(data) {
  // Handle different response formats
  let generatedText = '';
  
  if (Array.isArray(data)) {
    if (data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (typeof data[0] === 'string') {
      generatedText = data[0];
    } else if (data[0]?.text) {
      generatedText = data[0].text;
    } else if (data[0]?.response) {
      generatedText = data[0].response;
    }
  } else if (data.generated_text) {
    generatedText = data.generated_text;
  } else if (typeof data === 'string') {
    generatedText = data;
  } else if (data.text) {
    generatedText = data.text;
  } else if (data.response) {
    generatedText = data.response;
  }
  
  if (!generatedText) {
    throw new Error('Unexpected response format from Hugging Face API');
  }
  
  // Clean up the response (remove special tokens if present)
  generatedText = generatedText
    .replace(/<\|eot_id\|>/g, '')
    .replace(/<\|start_header_id\|>/g, '')
    .replace(/<\|end_header_id\|>/g, '')
    .replace(/<\|im_start\|>/g, '')
    .replace(/<\|im_end\|>/g, '')
    .replace(/<s>/g, '')
    .replace(/<\/s>/g, '')
    .replace(/\[INST\]/g, '')
    .replace(/\[\/INST\]/g, '')
    .replace(/<\|user\|>/g, '')
    .replace(/<\|assistant\|>/g, '')
    .trim();
  
  // Remove the original prompt if it's included in the response
  // (some models return the full prompt + response)
  const lines = generatedText.split('\n');
  const assistantIndex = lines.findIndex(line => 
    line.toLowerCase().includes('assistant:') || 
    line.toLowerCase().includes('assistant')
  );
  if (assistantIndex !== -1 && assistantIndex < lines.length - 1) {
    generatedText = lines.slice(assistantIndex + 1).join('\n').trim();
  }
  
  // Remove any remaining prompt text at the start
  if (generatedText.toLowerCase().startsWith('user:') || 
      generatedText.toLowerCase().startsWith('system:')) {
    const parts = generatedText.split(/assistant:/i);
    if (parts.length > 1) {
      generatedText = parts.slice(1).join('assistant:').trim();
    }
  }
  
  return generatedText || 'Sorry, I could not generate a response.';
}

/**
 * Generate embedding using Hugging Face (free)
 * Uses sentence-transformers feature extraction API
 */
export async function generateEmbeddingWithHuggingFace(text, model = 'sentence-transformers/all-MiniLM-L6-v2') {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Hugging Face API key not configured');
  }

  // Try multiple models as fallback
  const models = [
    'sentence-transformers/all-MiniLM-L6-v2',
    'sentence-transformers/paraphrase-MiniLM-L6-v2',
    'sentence-transformers/all-mpnet-base-v2'
  ];

  for (const tryModel of models) {
    try {
      // Use new router endpoint for embeddings
      const response = await fetch(`https://router.huggingface.co/pipeline/feature-extraction/${tryModel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true, // Wait for model to load if needed
          },
        }),
      });

      // Handle 503 (model loading) - wait and retry
      if (response.status === 503) {
        const retryAfter = response.headers.get('Retry-After') || 10;
        console.log(`Model ${tryModel} is loading, waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        // Retry once after waiting
        const retryResponse = await fetch(`https://router.huggingface.co/pipeline/feature-extraction/${tryModel}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            inputs: text,
            options: {
              wait_for_model: true,
            },
          }),
        });
        
        if (!retryResponse.ok) {
          continue; // Try next model
        }
        
        const data = await retryResponse.json();
        return extractEmbedding(data);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.log(`[AI] Model ${tryModel} failed: ${response.status} ${response.statusText}`);
        if (response.status === 404 || response.status === 410) {
          // Model not found, try next one
          continue;
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Hugging Face API authentication failed. Check your API key.`);
        }
        // For other errors, try next model
        continue;
      }

      const data = await response.json();
      return extractEmbedding(data);
    } catch (error) {
      // If this is the last model, throw the error
      if (tryModel === models[models.length - 1]) {
        console.error(`All embedding models failed. Last error: ${error.message}`);
        throw error;
      }
      // Otherwise, try next model
      console.log(`Model ${tryModel} failed, trying next model...`);
      continue;
    }
  }
  
  throw new Error('All Hugging Face embedding models failed');
}

/**
 * Extract embedding from Hugging Face response
 */
function extractEmbedding(data) {
  // Handle different response formats
  if (Array.isArray(data)) {
    if (Array.isArray(data[0])) {
      return data[0]; // Nested array
    }
    return data; // Direct array
  }
  
  // Sometimes it's an object with embeddings
  if (data.embeddings) {
    return Array.isArray(data.embeddings[0]) ? data.embeddings[0] : data.embeddings;
  }
  
  throw new Error('Unexpected embedding response format');
}

/**
 * Generate chat response using OpenAI API
 */
export async function generateWithOpenAI(prompt, systemPrompt, model = 'gpt-3.5-turbo') {
  const apiKey = process.env.OPENAI_API_KEY;
  const { temperature, top_p } = getLlmSamplingParams();
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature,
        top_p,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('OpenAI error:', error.message);
    throw error;
  }
}

/**
 * Get the active AI provider based on configuration
 */
export function getActiveProvider() {
  // Prioritize Hugging Face if API key is set
  if (process.env.AI_PROVIDER === 'huggingface' || (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'your_token_here' && process.env.HUGGINGFACE_API_KEY.startsWith('hf_'))) {
    return 'huggingface';
  } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    return 'openai';
  }
  return 'test'; // Fallback to test mode
}

