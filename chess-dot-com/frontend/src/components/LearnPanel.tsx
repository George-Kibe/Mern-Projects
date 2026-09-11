import type { Moment, MomentLine } from '../lib/analysis/moment';
import type { MoveInsight } from '../lib/chess/describeMove';
import { Button } from './ui';

export type OpenLine = {
  lineId: string;
  label: string;
  basePly: number;
  sans: string[];
  idx: number;
};

const TONE_STYLE: Record<Moment['tone'], { border: string; bg: string; text: string }> = {
  critical: { border: 'border-tag-blunder/70', bg: 'bg-tag-blunder/15', text: 'text-tag-blunder' },
  warning: { border: 'border-tag-mistake/70', bg: 'bg-tag-mistake/15', text: 'text-tag-mistake' },
  good: { border: 'border-tag-brilliant/70', bg: 'bg-tag-brilliant/15', text: 'text-tag-brilliant' },
  info: { border: 'border-accent/70', bg: 'bg-accent/15', text: 'text-accent' },
};

export type LearnPanelProps = {
  moment: Moment | null;
  /** Full prose coaching for the current move, when there is no special moment. */
  fallbackText: string | null;
  open: OpenLine | null;
  /** Explanation of the move currently shown inside the open line. */
  insight: MoveInsight | null;
  onOpenLine: (line: MomentLine) => void;
  onStep: (idx: number) => void;
  onClose: () => void;
  onSpeak: () => void;
  speaking: boolean;
};

/**
 * The teaching surface: what just happened, why it matters, and the lines that
 * prove it — with step controls that are always on screen.
 *
 * The navigation deliberately sits directly under the heading rather than at the
 * end of the text: buried at the bottom of a scrolling column it was effectively
 * invisible, which made the explanations look like dead ends.
 */
export function LearnPanel({
  moment,
  fallbackText,
  open,
  insight,
  onOpenLine,
  onStep,
  onClose,
  onSpeak,
  speaking,
}: LearnPanelProps) {
  const tone = TONE_STYLE[moment?.tone ?? 'info'];

  // --- Walking through a line ---
  if (open) {
    const atStart = open.idx <= 1;
    const atEnd = open.idx >= open.sans.length;

    return (
      <section className={`overflow-hidden rounded-lg border ${tone.border} bg-panel`}>
        <header className={`flex flex-wrap items-center gap-2 px-3 py-2 ${tone.bg}`}>
          <span className={`text-sm font-bold ${tone.text}`}>{open.label}</span>
          <span className="font-mono text-xs text-ink-soft">
            move {open.idx} of {open.sans.length}
          </span>
          <Button variant="ghost" onClick={onClose} className="ml-auto">
            ↩ Back to the game
          </Button>
        </header>

        {/* Controls first, so they can never be scrolled out of reach. */}
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <Button variant="ghost" onClick={() => onStep(1)} disabled={atStart}>⏮</Button>
          <Button variant="ghost" onClick={() => onStep(open.idx - 1)} disabled={atStart}>◀</Button>
          <Button
            variant="primary"
            onClick={() => onStep(open.idx + 1)}
            disabled={atEnd}
            className="min-w-[7.5rem]"
          >
            {atEnd ? 'End of line' : 'Next move ▶'}
          </Button>
          <Button variant="ghost" onClick={() => onStep(open.sans.length)} disabled={atEnd}>⏭</Button>
          <span className="ml-auto text-xs text-ink-soft">← → also step</span>
        </div>

        <div className="max-h-[200px] overflow-y-auto p-3">
          {/* What this move does comes first: it is the reason to be here, and
              below the move list it fell off the bottom of the screen. */}
          {insight ? (
            <div className="rounded bg-panel-soft p-2">
              <div className="text-sm font-semibold">
                <span className="font-mono text-accent">{insight.san}</span> — {insight.headline}
              </div>
              {insight.facts.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {insight.facts.map((fact, i) => (
                    <li key={i} className="text-xs text-ink-soft">· {fact}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1">
            {open.sans.map((san, i) => (
              <button
                key={i}
                onClick={() => onStep(i + 1)}
                className={`rounded px-1.5 py-0.5 font-mono text-sm ${
                  open.idx === i + 1
                    ? 'bg-accent font-bold text-black'
                    : 'text-ink-soft hover:bg-panel-soft hover:text-ink'
                }`}
              >
                {(open.basePly + i) % 2 === 0
                  ? `${Math.floor((open.basePly + i) / 2) + 1}.`
                  : ''}
                {san}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- A learning moment, not yet opened ---
  if (moment) {
    return (
      <section className={`overflow-hidden rounded-lg border ${tone.border} bg-panel`}>
        <header className={`flex flex-wrap items-center gap-2 px-3 py-2 ${tone.bg}`}>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${tone.text} bg-black/30`}>
            {moment.badge}
          </span>
          <span className="text-sm font-semibold">{moment.title}</span>
          <Button variant="ghost" onClick={onSpeak} className="ml-auto">
            {speaking ? '■ Stop' : '🔊 Speak'}
          </Button>
        </header>

        <div className="flex flex-col gap-2 p-3">
          <p className="text-sm leading-relaxed">{moment.why}</p>

          {moment.lines.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {moment.lines.map((line) => (
                <Button key={line.id} variant="primary" onClick={() => onOpenLine(line)} title={line.hint}>
                  ▶ {line.label}
                </Button>
              ))}
            </div>
          ) : null}

          {fallbackText ? (
            <details className="text-xs text-ink-soft">
              <summary className="cursor-pointer">Full coaching</summary>
              <p className="mt-1 leading-relaxed">{fallbackText}</p>
            </details>
          ) : null}
        </div>
      </section>
    );
  }

  // --- Nothing special here ---
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-panel">
      <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <h2 className="text-sm font-semibold">Coach</h2>
        <Button variant="ghost" onClick={onSpeak} disabled={!fallbackText}>
          {speaking ? '■ Stop' : '▶ Speak'}
        </Button>
      </header>
      <div className="max-h-[150px] overflow-y-auto p-3">
        <p className="text-sm leading-relaxed text-ink-soft">
          {fallbackText ?? 'Step through the game — the coach stops you at anything worth learning.'}
        </p>
      </div>
    </section>
  );
}
