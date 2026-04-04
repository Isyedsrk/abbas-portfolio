/**
 * Generate a simple mock embedding for testing (1536 dimensions like text-embedding-3-small)
 * Uses a hash-based approach to create consistent embeddings
 */
export function generateMockEmbedding(text) {
  const embedding = new Array(1536).fill(0);
  let hash = 0;
  
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use hash to seed random-like values
  for (let i = 0; i < embedding.length; i++) {
    hash = ((hash << 5) - hash) + i;
    embedding[i] = (Math.sin(hash) * 10000) % 1;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}



