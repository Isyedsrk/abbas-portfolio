/**
 * Lazy singleton query embeddings (same model as chat) for offline export / RAG fallback.
 */

import { pipeline } from '@xenova/transformers';

let extractorPromise = null;

export async function embedQueryText(text) {
  const t = String(text || '').trim();
  if (!t) {
    throw new Error('embedQueryText: empty text');
  }
  if (!extractorPromise) {
    extractorPromise = pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  const extractor = await extractorPromise;
  const output = await extractor(t, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
