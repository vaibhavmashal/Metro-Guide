import React from 'react';

interface FormattedMessageProps {
  text: string;
  isUser: boolean;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, isUser }) => {
  if (isUser) {
    return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>;
  }

  // Parse inline markdown: **bold**, *italic*, `code`, [links](url)
  const parseInline = (content: string, keyPrefix: string = 'inline'): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // Regex for bold (**...** or __...__), code (`...`), and italic (*...* or _..._)
    const inlineRegex = /(\*\*|__)(.*?)\1|(`)(.*?)\3|(\*|_)(.*?)\5/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let counter = 0;

    while ((match = inlineRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      if (match[1]) {
        // Bold
        parts.push(
          <strong
            key={`${keyPrefix}-bold-${counter++}`}
            style={{ fontWeight: 600, color: '#f8fafc' }}
          >
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Code
        parts.push(
          <code
            key={`${keyPrefix}-code-${counter++}`}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.88em',
              fontFamily: 'monospace',
              color: '#e2e8f0',
            }}
          >
            {match[4]}
          </code>
        );
      } else if (match[5]) {
        // Italic
        parts.push(
          <em
            key={`${keyPrefix}-italic-${counter++}`}
            style={{ fontStyle: 'italic', color: '#cbd5e1' }}
          >
            {match[6]}
          </em>
        );
      }

      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
  };

  // Split lines and group blocks
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip divider lines like === or ---
    if (/^[=-]{3,}$/.test(line)) {
      i++;
      continue;
    }

    if (!line) {
      i++;
      continue;
    }

    // Check for Heading (#, ##, ###) or Section Emojis
    const headingMatch = line.match(/^(###|##|#)\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      elements.push(
        <div
          key={`heading-${i}`}
          style={{
            fontSize: level === 1 ? '15px' : level === 2 ? '14px' : '13px',
            fontWeight: 700,
            color: '#a78bfa',
            marginTop: elements.length > 0 ? '10px' : '2px',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {parseInline(headingText, `h-${i}`)}
        </div>
      );
      i++;
      continue;
    }

    // Check for section headers with emojis (📍 Station, 🚇 Route, etc.) if they stand alone on a short line or have bold/section titles
    if (/^[📍🚇🔄💰⏱🚉💡⚠️🛡️📌⭐️].*/.test(line) && line.length < 50) {
      elements.push(
        <div
          key={`section-${i}`}
          style={{
            fontSize: '13.5px',
            fontWeight: 700,
            color: '#c4b5fd',
            marginTop: elements.length > 0 ? '10px' : '2px',
            marginBottom: '4px',
            background: 'rgba(124, 58, 237, 0.16)',
            padding: '4px 10px',
            borderRadius: '8px',
            borderLeft: '3px solid #8b5cf6',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {parseInline(line, `sec-${i}`)}
        </div>
      );
      i++;
      continue;
    }

    // Check for unordered lists (*, -, •)
    if (/^(\*|-|•)\s+(.*)/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^(\*|-|•)\s+(.*)/);
        if (itemMatch) {
          listItems.push(
            <li key={`ul-item-${i}`} style={{ marginBottom: '4px', lineHeight: '1.45' }}>
              {parseInline(itemMatch[2], `ul-${i}`)}
            </li>
          );
          i++;
        } else if (lines[i].trim() === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          style={{
            margin: '4px 0',
            paddingLeft: '18px',
            listStyleType: 'disc',
            color: '#e2e8f0',
          }}
        >
          {listItems}
        </ul>
      );
      continue;
    }

    // Check for ordered lists (1., 2., etc.)
    if (/^(\d+)\.\s+(.*)/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^(\d+)\.\s+(.*)/);
        if (itemMatch) {
          listItems.push(
            <li key={`ol-item-${i}`} style={{ marginBottom: '4px', lineHeight: '1.45' }}>
              {parseInline(itemMatch[2], `ol-${i}`)}
            </li>
          );
          i++;
        } else if (lines[i].trim() === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          style={{
            margin: '4px 0',
            paddingLeft: '18px',
            listStyleType: 'decimal',
            color: '#e2e8f0',
          }}
        >
          {listItems}
        </ol>
      );
      continue;
    }

    // Regular paragraph / text line
    elements.push(
      <div
        key={`p-${i}`}
        style={{
          marginBottom: '6px',
          lineHeight: '1.45',
          color: '#e2e8f0',
          wordBreak: 'break-word',
        }}
      >
        {parseInline(line, `p-${i}`)}
      </div>
    );
    i++;
  }

  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
};
