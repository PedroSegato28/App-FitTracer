import { Workout, Goal, Schedule } from './types';

export const WORKOUT_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-400 to-red-500',
  'from-emerald-400 to-teal-600',
  'from-indigo-500 to-blue-600',
  'from-pink-500 to-rose-500',
];

export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const DEFAULT_WORKOUTS: Workout[] = [
  {
    id: '1',
    name: 'Treino A - Peito e Tríceps',
    day: 'Segunda',
    color: WORKOUT_COLORS[0],
    exercises: [
      { id: '1', name: 'Supino Reto', sets: 4, reps: '8-12', weight: 60 },
      { id: '2', name: 'Supino Inclinado', sets: 3, reps: '10-12', weight: 50 },
      { id: '3', name: 'Crucifixo', sets: 3, reps: '12-15', weight: 20 },
      { id: '4', name: 'Tríceps Testa', sets: 3, reps: '10-12', weight: 30 },
      { id: '5', name: 'Tríceps Corda', sets: 3, reps: '12-15', weight: 25 },
    ],
  },
  {
    id: '2',
    name: 'Treino B - Costas e Bíceps',
    day: 'Quarta',
    color: WORKOUT_COLORS[1],
    exercises: [
      { id: '1', name: 'Barra Fixa', sets: 4, reps: '8-12' },
      { id: '2', name: 'Remada Curvada', sets: 4, reps: '8-12', weight: 50 },
      { id: '3', name: 'Pulldown', sets: 3, reps: '10-12', weight: 40 },
      { id: '4', name: 'Rosca Direta', sets: 3, reps: '10-12', weight: 15 },
      { id: '5', name: 'Rosca Martelo', sets: 3, reps: '12-15', weight: 12 },
    ],
  },
  {
    id: '3',
    name: 'Treino C - Pernas',
    day: 'Sexta',
    color: WORKOUT_COLORS[2],
    exercises: [
      { id: '1', name: 'Agachamento', sets: 4, reps: '8-12', weight: 80 },
      { id: '2', name: 'Leg Press', sets: 4, reps: '10-12', weight: 150 },
      { id: '3', name: 'Cadeira Extensora', sets: 3, reps: '12-15', weight: 40 },
      { id: '4', name: 'Cadeira Flexora', sets: 3, reps: '12-15', weight: 35 },
      { id: '5', name: 'Panturrilha', sets: 4, reps: '15-20', weight: 60 },
    ],
  },
];

export const DEFAULT_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Ganhar Massa Muscular',
    description: 'Meta de ganho de peso',
    target: 5,
    current: 2,
    unit: 'kg',
    completed: false,
  },
  {
    id: '2',
    title: 'Frequência Semanal',
    description: 'Treinar 5 vezes por semana',
    target: 5,
    current: 3,
    unit: 'treinos',
    completed: false,
  },
];
