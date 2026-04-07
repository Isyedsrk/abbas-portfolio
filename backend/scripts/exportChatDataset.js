#!/usr/bin/env node
/**
 * Export portfolio chat logs to JSONL for training.
 *
 * Usage:
 *   node scripts/exportChatDataset.js [--out path] [--rejected path] [--since ISO] [--no-rag-fallback] [--include-static]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { buildChatTrainingDataset } from '../utils/dataset/exportDataset.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

function parseArgs(argv) {
  const out = { out: '', rejected: '', since: '', ragFallback: true, includeStatic: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out' && argv[i + 1]) {
      out.out = argv[++i];
    } else if (a === '--rejected' && argv[i + 1]) {
      out.rejected = argv[++i];
    } else if (a === '--since' && argv[i + 1]) {
      out.since = argv[++i];
    } else if (a === '--no-rag-fallback') {
      out.ragFallback = false;
    } else if (a === '--include-static') {
      out.includeStatic = true;
    }
  }
  if (!out.out) {
    out.out = path.join(__dirname, '../data/chat_training_dataset.jsonl');
  }
  return out;
}

function writeJsonl(filePath, objects) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const lines = objects.map((o) => JSON.stringify(o));
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv);
  console.log('[export] Building dataset...', {
    out: args.out,
    rejected: args.rejected || '(none)',
    since: args.since || '(all)',
    ragFallback: args.ragFallback,
    includeStatic: args.includeStatic,
  });

  const result = await buildChatTrainingDataset({
    since: args.since || undefined,
    ragFallback: args.ragFallback,
    includeStaticTemplates: args.includeStatic,
  });

  writeJsonl(args.out, result.records);
  console.log('[export] Wrote', result.records.length, 'records →', args.out);

  if (args.rejected) {
    writeJsonl(args.rejected, result.rejectedRecords);
    console.log(
      '[export] Wrote',
      result.rejectedRecords.length,
      'rejected →',
      args.rejected
    );
  }

  console.log('[export] Stats:', result.stats);
}

main().catch((e) => {
  console.error('[export] Failed:', e);
  process.exit(1);
});
