export type ParticipantTone = {
  /** Tinted fill plus matching text, for an avatar or a chip. */
  surface: string
  /** The hue alone, for text or an icon sitting on a neutral surface. */
  text: string
  /** A rule or dot marking a row as belonging to this participant. */
  edge: string
  /** A saturated fill carrying white content, for an avatar or a bar. */
  fill: string
}

/**
 * Ten hues, assigned by hashing the name, so a participant keeps the same
 * colour on every screen without anything being stored. The classes are written
 * out rather than interpolated because Tailwind only sees literal strings.
 */
const TONES: readonly ParticipantTone[] = [
  {
    surface: 'bg-participant-1/12 text-participant-1',
    text: 'text-participant-1',
    edge: 'bg-participant-1',
    fill: 'bg-participant-1',
  },
  {
    surface: 'bg-participant-2/12 text-participant-2',
    text: 'text-participant-2',
    edge: 'bg-participant-2',
    fill: 'bg-participant-2',
  },
  {
    surface: 'bg-participant-3/12 text-participant-3',
    text: 'text-participant-3',
    edge: 'bg-participant-3',
    fill: 'bg-participant-3',
  },
  {
    surface: 'bg-participant-4/12 text-participant-4',
    text: 'text-participant-4',
    edge: 'bg-participant-4',
    fill: 'bg-participant-4',
  },
  {
    surface: 'bg-participant-5/12 text-participant-5',
    text: 'text-participant-5',
    edge: 'bg-participant-5',
    fill: 'bg-participant-5',
  },
  {
    surface: 'bg-participant-6/12 text-participant-6',
    text: 'text-participant-6',
    edge: 'bg-participant-6',
    fill: 'bg-participant-6',
  },
  {
    surface: 'bg-participant-7/12 text-participant-7',
    text: 'text-participant-7',
    edge: 'bg-participant-7',
    fill: 'bg-participant-7',
  },
  {
    surface: 'bg-participant-8/12 text-participant-8',
    text: 'text-participant-8',
    edge: 'bg-participant-8',
    fill: 'bg-participant-8',
  },
  {
    surface: 'bg-participant-9/12 text-participant-9',
    text: 'text-participant-9',
    edge: 'bg-participant-9',
    fill: 'bg-participant-9',
  },
  {
    surface: 'bg-participant-10/12 text-participant-10',
    text: 'text-participant-10',
    edge: 'bg-participant-10',
    fill: 'bg-participant-10',
  },
]

/** Pick a tone by position rather than by name, for anything that already has
 *  a stable slot of its own — a category, say. */
export function toneAt(index: number): ParticipantTone {
  return TONES[((index % TONES.length) + TONES.length) % TONES.length]
}

export function participantTone(name: string): ParticipantTone {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return TONES[hash % TONES.length]
}
