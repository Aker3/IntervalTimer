import type { Config, Phase } from '../types'
import { uid } from './storage'

export interface Preset {
  id: string
  name: string
  category: string
  config: Config
}

function phase(type: Phase['type'], secs: number, extras: Partial<Phase> = {}): Phase {
  return { id: uid(), type, secs, ...extras }
}

export const PRESETS: Preset[] = [
  // Exercise
  {
    id: 'hiit-classic',
    name: 'HIIT clásico',
    category: 'Ejercicio',
    config: {
      rounds: 8,
      readySecs: 5,
      phases: [phase('work', 40), phase('rest', 20)],
    },
  },
  {
    id: 'tabata',
    name: 'Tabata',
    category: 'Ejercicio',
    config: {
      rounds: 8,
      readySecs: 5,
      phases: [phase('work', 20), phase('rest', 10)],
    },
  },
  {
    id: 'emom',
    name: 'EMOM',
    category: 'Ejercicio',
    config: {
      rounds: 10,
      readySecs: 5,
      phases: [phase('work', 45, { name: 'Work' }), phase('rest', 15, { name: 'Rest' })],
    },
  },
  {
    id: 'long-intervals',
    name: 'Intervalos largos',
    category: 'Ejercicio',
    config: {
      rounds: 4,
      readySecs: 10,
      phases: [phase('work', 180), phase('rest', 60)],
    },
  },
  {
    id: 'calisthenics',
    name: 'Calistenia',
    category: 'Ejercicio',
    config: {
      rounds: 6,
      readySecs: 5,
      phases: [phase('work', 45), phase('rest', 15)],
    },
  },
  // Therapy
  {
    id: 'contrast-standard',
    name: 'Contraste estándar',
    category: 'Terapia frío/calor',
    config: {
      rounds: 3,
      readySecs: 10,
      phases: [phase('hot', 180), phase('cold', 60)],
    },
  },
  {
    id: 'sauna-cold',
    name: 'Sauna + frío',
    category: 'Terapia frío/calor',
    config: {
      rounds: 2,
      readySecs: 15,
      phases: [phase('hot', 600), phase('cold', 120)],
    },
  },
  {
    id: 'contrast-alternating',
    name: 'Contraste alternado',
    category: 'Terapia frío/calor',
    config: {
      rounds: 4,
      readySecs: 10,
      phases: [phase('hot', 120), phase('cold', 60)],
    },
  },
  // Work
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    category: 'Trabajo',
    config: {
      rounds: 4,
      readySecs: 0,
      phases: [phase('work', 1500, { name: 'Focus' }), phase('rest', 300, { name: 'Break' })],
    },
  },
  {
    id: 'fifty-two-seventeen',
    name: '52 / 17',
    category: 'Trabajo',
    config: {
      rounds: 2,
      readySecs: 0,
      phases: [phase('work', 3120, { name: 'Focus' }), phase('rest', 1020, { name: 'Break' })],
    },
  },
  {
    id: 'deep-work',
    name: 'Trabajo profundo',
    category: 'Trabajo',
    config: {
      rounds: 2,
      readySecs: 0,
      phases: [phase('work', 5400, { name: 'Focus' }), phase('rest', 900, { name: 'Break' })],
    },
  },
  // Other
  {
    id: 'breath-4-4',
    name: 'Respiración 4-4',
    category: 'Otros',
    config: {
      rounds: 10,
      readySecs: 3,
      phases: [
        phase('work', 4, { name: 'Inhale' }),
        phase('rest', 4, { name: 'Exhale' }),
      ],
    },
  },
  {
    id: 'stretching',
    name: 'Estiramiento',
    category: 'Otros',
    config: {
      rounds: 6,
      readySecs: 5,
      phases: [phase('work', 30, { name: 'Stretch' }), phase('rest', 15, { name: 'Rest' })],
    },
  },
  {
    id: 'yoga-flow',
    name: 'Yoga flow',
    category: 'Otros',
    config: {
      rounds: 8,
      readySecs: 5,
      phases: [phase('work', 60, { name: 'Pose' }), phase('rest', 30, { name: 'Transition' })],
    },
  },
]
