export type Anchor = { label: string; v: number; a: number };

const ANCHORS: Anchor[] = [
  { label: 'alert',     v:  0.00, a:  0.95 },
  { label: 'excited',   v:  0.50, a:  0.85 },
  { label: 'elated',    v:  0.70, a:  0.70 },
  { label: 'happy',     v:  0.85, a:  0.20 },
  { label: 'content',   v:  0.70, a: -0.20 },
  { label: 'relaxed',   v:  0.50, a: -0.60 },
  { label: 'serene',    v:  0.20, a: -0.85 },
  { label: 'calm',      v:  0.00, a: -0.95 },
  { label: 'fatigued',  v: -0.20, a: -0.85 },
  { label: 'depressed', v: -0.70, a: -0.70 },
  { label: 'sad',       v: -0.85, a: -0.20 },
  { label: 'bored',     v: -0.50, a: -0.60 },
  { label: 'distressed',v: -0.70, a:  0.70 },
  { label: 'angry',     v: -0.85, a:  0.20 },
  { label: 'tense',     v: -0.50, a:  0.85 },
  { label: 'nervous',   v: -0.20, a:  0.95 },
];

export function moodLabelFromVA(valence: number, activation: number, anchors = ANCHORS): string {
  const v = Math.max(-1, Math.min(1, valence));
  const a = Math.max(-1, Math.min(1, activation));

  const radius = Math.hypot(v, a);
  if (radius < 0.18) return 'neutral';

  let nearest = anchors[0];
  let minDistance = Infinity;

  for (const anchor of anchors) {
    const d = Math.hypot(v - anchor.v, a - anchor.a);
    if (d < minDistance) {
      minDistance = d;
      nearest = anchor;
    }
  }

  return nearest.label;
}

const LABEL_TO_FA_ICON: Record<string, string> = {
  alert: 'fa-face-surprise',
  excited: 'fa-face-grin-stars',
  elated: 'fa-face-laugh-beam',
  happy: 'fa-face-smile',
  content: 'fa-face-smile-beam',
  relaxed: 'fa-face-meh',
  serene: 'fa-face-grin-beam',
  calm: 'fa-face-meh-blank',
  fatigued: 'fa-face-tired',
  depressed: 'fa-face-sad-tear',
  sad: 'fa-face-frown',
  bored: 'fa-face-meh',
  distressed: 'fa-face-dizzy',
  angry: 'fa-face-angry',
  tense: 'fa-face-grimace',
  nervous: 'fa-face-flushed',
  neutral: 'fa-face-meh',
};

export function moodIconFromVA(
  valence: number,
  activation: number,
  style: 'solid' | 'regular' | 'brands' = 'solid'
): string {
  const label = moodLabelFromVA(valence, activation);
  const icon = LABEL_TO_FA_ICON[label] ?? 'fa-circle-question';
  const prefix = style === 'solid' ? 'fas' : style === 'regular' ? 'far' : 'fab';
  return `${prefix} ${icon}`;
}