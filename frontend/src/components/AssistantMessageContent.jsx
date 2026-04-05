import React from 'react';
import './AssistantMessageContent.css';

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatInline(s) {
  let t = escapeHtml(s);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return t;
}

function renderParagraphs(block) {
  if (!block || !block.trim()) return null;
  return block.split(/\n\n+/).map((para, i) => {
    const lines = para.split('\n').filter((l) => l.trim());
    const allBullets = lines.length > 0 && lines.every((l) => /^\s*[-*]\s/.test(l));
    if (allBullets) {
      return (
        <ul key={i} className="assistant-msg-list">
          {lines.map((l, j) => {
            const t = l.replace(/^\s*[-*]\s+/, '');
            return (
              <li
                key={j}
                dangerouslySetInnerHTML={{ __html: formatInline(t) }}
              />
            );
          })}
        </ul>
      );
    }
    const joined = lines.map((l) => formatInline(l)).join('<br/>');
    return (
      <p
        key={i}
        className="assistant-msg-p"
        dangerouslySetInnerHTML={{ __html: joined }}
      />
    );
  });
}

function renderFormattedText(text) {
  if (!text || !text.trim()) return null;
  const parts = text.split(/\n(?=###+\s)/);
  return parts.map((part, i) => {
    const m = part.match(/^(###+)\s*(.+?)\n/);
    if (m) {
      const level = m[1].length;
      const Tag = level <= 2 ? 'h3' : 'h4';
      const body = part.slice(m[0].length);
      return (
        <div key={i} className="assistant-msg-block">
          <Tag className={level <= 2 ? 'assistant-msg-h3' : 'assistant-msg-h4'}>
            {m[2].trim()}
          </Tag>
          {renderParagraphs(body)}
        </div>
      );
    }
    return <div key={i}>{renderParagraphs(part)}</div>;
  });
}

/**
 * Parse optional ### Quick answer / ### More detail (or In depth / Details) from model output.
 */
export function parseStructuredAnswer(text) {
  const trimmed = (text || '').trim();
  const quickRe = /###\s*Quick answer\s*\n/i;
  const detailRe =
    /\n###\s*(More detail|More details|In depth|Details|Deep dive)\s*\n/i;

  if (!quickRe.test(trimmed)) {
    return { hasStructure: false, quick: trimmed, detail: null };
  }

  const afterQuick = trimmed.replace(/^[\s\S]*?###\s*Quick answer\s*\n/i, '');
  const detailMatch = afterQuick.match(detailRe);
  let quick;
  let detail = null;
  if (detailMatch) {
    quick = afterQuick.slice(0, detailMatch.index).trim();
    detail = afterQuick.slice(detailMatch.index + detailMatch[0].length).trim();
  } else {
    quick = afterQuick.trim();
  }

  return { hasStructure: true, quick, detail };
}

export default function AssistantMessageContent({ text }) {
  const { hasStructure, quick, detail } = parseStructuredAnswer(text);

  if (hasStructure && quick) {
    return (
      <div className="assistant-msg-root">
        <div className="assistant-msg-quick">
          <h4 className="assistant-msg-quick-title">Quick answer</h4>
          <div className="assistant-msg-quick-body">{renderFormattedText(quick)}</div>
        </div>
        {detail ? (
          <details className="assistant-msg-details">
            <summary className="assistant-msg-summary">More detail</summary>
            <div className="assistant-msg-detail-inner">
              {renderFormattedText(detail)}
            </div>
          </details>
        ) : null}
      </div>
    );
  }

  return (
    <div className="assistant-msg-root assistant-msg-plain">
      {renderFormattedText(quick || text)}
    </div>
  );
}
