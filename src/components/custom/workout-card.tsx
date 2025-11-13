'use client';

import { Workout } from '@/lib/types';
import { Dumbbell, Trash2, Edit2, Play, CheckCircle2, Plus, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface WorkoutCardProps {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onToggleExercise: (workoutId: string, exerciseId: string) => void;
  onStartWorkout: (workoutId: string) => void;
  onFinishWorkout: (workoutId: string) => void;
  onUpdateWeight: (workoutId: string, exerciseId: string, newWeight: number) => void;
}

export function WorkoutCard({ 
  workout, 
  onEdit, 
  onDelete, 
  onToggleExercise,
  onStartWorkout,
  onFinishWorkout,
  onUpdateWeight
}: WorkoutCardProps) {
  const completedCount = workout.exercises.filter(e => e.completed).length;
  const totalCount = workout.exercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const handleWeightChange = (exerciseId: string, increment: boolean) => {
    const exercise = workout.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      const currentWeight = exercise.weight || 0;
      const newWeight = increment ? currentWeight + 2.5 : Math.max(0, currentWeight - 2.5);
      onUpdateWeight(workout.id, exerciseId, newWeight);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className={`h-2 bg-gradient-to-r ${workout.color}`} />
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{workout.name}</h3>
              {workout.inProgress && (
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full animate-pulse">
                  Em andamento
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{workout.day}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(workout)}
              className="h-8 w-8"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(workout.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progresso</span>
            <span className="font-semibold text-gray-900">{completedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${workout.color} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Start/Finish Workout Button */}
        <div className="mb-4">
          {!workout.inProgress ? (
            <Button
              onClick={() => onStartWorkout(workout.id)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Treino
            </Button>
          ) : (
            <Button
              onClick={() => onFinishWorkout(workout.id)}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Concluir Treino
            </Button>
          )}
        </div>

        {/* Exercises List */}
        <div className="space-y-2">
          {workout.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={exercise.completed}
                  onCheckedChange={() => onToggleExercise(workout.id, exercise.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm sm:text-base ${exercise.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {exercise.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {exercise.sets}x {exercise.reps}
                    {exercise.weight && ` • ${exercise.weight}kg`}
                  </p>
                </div>
                {workout.inProgress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                    className="text-xs"
                  >
                    Peso
                  </Button>
                )}
              </div>

              {/* Weight Control */}
              {workout.inProgress && expandedExercise === exercise.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Ajustar Peso</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleWeightChange(exercise.id, false)}
                        className="h-8 w-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-lg font-bold text-gray-900 min-w-[60px] text-center">
                        {exercise.weight || 0}kg
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleWeightChange(exercise.id, true)}
                        className="h-8 w-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
