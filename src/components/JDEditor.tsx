'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Flag } from '@/lib/types';

interface JDEditorProps {
  text: string;
  flags: Flag[];
  onTextChange?: (text: string) => void;
  selectedFlag?: Flag | null;
  acceptedFlags?: Set<string>;
}

interface HighlightSegment {
  text: string;
  flag?: Flag;
  accepted?: boolean;
}

function buildSegments(
  text: string,
  flags: Flag[],
  acceptedFlags: Set<string>
): HighlightSegment[] {
  if (flags.length === 0) return [{ text }];

  type Match = { start: number; end: number; flag: Flag };
  const matches: Match[] = [];
  for (const flag of flags) {
    const lowerText = text.toLowerCase();
    const lowerPhrase = flag.phrase.toLowerCase();
    let idx = 0;
    while ((idx = lowerText.indexOf(lowerPhrase, idx)) !== -1) {
      matches.push({ start: idx, end: idx + flag.phrase.length, flag });
      idx += flag.phrase.length;
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start < cursor) continue;
    if (match.start > cursor) {
      segments.push({ text: text.slice(cursor, match.start) });
    }
    segments.push({
      text: text.slice(match.start, match.end),
      flag: match.flag,
      accepted: acceptedFlags.has(match.flag.phrase),
    });
    cursor = match.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments;
}

export default function JDEditor({
  text,
  flags,
  onTextChange,
  selectedFlag,
  acceptedFlags = new Set(),
}: JDEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => text.split('\n'), [text]);

  const lineSegments = useMemo(() => {
    const result: HighlightSegment[][] = [];
    let globalOffset = 0;

    for (const line of lines) {
      const lineFlags = flags.filter((f) => {
        const lower = text.toLowerCase();
        const phraseL = f.phrase.toLowerCase();
        let idx = 0;
        while ((idx = lower.indexOf(phraseL, idx)) !== -1) {
          if (idx >= globalOffset && idx < globalOffset + line.length) return true;
          idx += phraseL.length;
        }
        return false;
      });
      result.push(buildSegments(line, lineFlags, acceptedFlags));
      globalOffset += line.length + 1; // +1 for newline
    }

    return result;
  }, [text, lines, flags, acceptedFlags]);

  const scrollToFlag = useCallback(
    (flag: Flag) => {
      if (!editorRef.current) return;
      const marks = editorRef.current.querySelectorAll('[data-flag-phrase]');
      for (const mark of Array.from(marks)) {
        if (
          (mark as HTMLElement).dataset.flagPhrase?.toLowerCase() ===
          flag.phrase.toLowerCase()
        ) {
          mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (mark as HTMLElement).classList.add('ring-2', 'ring-coral', 'ring-offset-1');
          setTimeout(() => {
            (mark as HTMLElement).classList.remove(
              'ring-2',
              'ring-coral',
              'ring-offset-1'
            );
          }, 2000);
          break;
        }
      }
    },
    []
  );

  useEffect(() => {
    if (selectedFlag) {
      scrollToFlag(selectedFlag);
    }
  }, [selectedFlag, scrollToFlag]);

  const handleScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  return (
    <div className="flex rounded-2xl border border-slate-deep/10 bg-white shadow-card overflow-hidden font-mono text-sm">
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="shrink-0 w-12 bg-slate-deep/[0.03] border-r border-slate-deep/10 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="py-4 px-2 text-right">
          {lines.map((_, i) => (
            <div
              key={i}
              className="leading-6 text-xs text-slate-light/50"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Editor content */}
      <div
        ref={editorRef}
        className="flex-1 overflow-auto max-h-[500px] min-h-[300px]"
        onScroll={handleScroll}
      >
        {onTextChange ? (
          <textarea
            className="w-full h-full p-4 leading-6 resize-none bg-transparent outline-none text-slate-deep"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="p-4 leading-6 whitespace-pre-wrap text-slate-deep">
            {lineSegments.map((segments, lineIdx) => (
              <div key={lineIdx} className="min-h-[1.5rem]">
                {segments.map((seg, segIdx) => {
                  if (seg.flag) {
                    const isSelected =
                      selectedFlag?.phrase.toLowerCase() ===
                      seg.flag.phrase.toLowerCase();
                    return (
                      <mark
                        key={segIdx}
                        data-flag-phrase={seg.flag.phrase}
                        className={`rounded px-0.5 transition-all duration-300 ${
                          seg.accepted
                            ? 'bg-mint-bg underline decoration-mint decoration-2 underline-offset-2'
                            : 'bg-coral-bg underline decoration-coral decoration-2 underline-offset-2'
                        } ${isSelected ? 'ring-2 ring-coral ring-offset-1' : ''}`}
                      >
                        {seg.text}
                      </mark>
                    );
                  }
                  return <span key={segIdx}>{seg.text}</span>;
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
