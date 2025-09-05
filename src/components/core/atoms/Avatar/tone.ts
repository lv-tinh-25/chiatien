export type ParticipantTone = {
  /** Tinted fill plus matching text, for an avatar or a chip. */
  surface: string
  /** The hue alone, for text or an icon sitting on a neutral surface. */
  text: string
  /** A rule or dot marking a row as belonging to this participant. */
  edge: string
}

/**
 * Eight hues, assigned by hashing the name, so a participant keeps the same
 * colour on every screen without anything being stored. The classes are written
 * out rather than interpolated because Tailwind only sees literal strings.
 */
const TONES: readonly ParticipantTone[] = [
  {
    surface: 'bg-participant-1/12 text-participant-1',
    text: 'text-participant-1',
    edge: 'bg-participant-1',
  },
  {
    surface: 'bg-participant-2/12 text-participant-2',
    text: 'text-participant-2',
    edge: 'bg-participant-2',
  },
  {
    surface: 'bg-participant-3/12 text-participant-3',
    text: 'text-participant-3',
    edge: 'bg-participant-3',
  },
  {
    surface: 'bg-participant-4/12 text-participant-4',
    text: 'text-participant-4',
    edge: 'bg-participant-4',
  },
  {
    surface: 'bg-participant-5/12 text-participant-5',
    text: 'text-participant-5',
    edge: 'bg-participant-5',
  },
  {
    surface: 'bg-participant-6/12 text-participant-6',
    text: 'text-participant-6',
    edge: 'bg-participant-6',
  },
  {
    surface: 'bg-participant-7/12 text-participant-7',
    text: 'text-participant-7',
    edge: 'bg-participant-7',
  },
  {
    surface: 'bg-participant-8/12 text-participant-8',
    text: 'text-participant-8',
    edge: 'bg-participant-8',
  },
]

export function participantTone(name: string): ParticipantTone {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return TONES[hash % TONES.length]
}
