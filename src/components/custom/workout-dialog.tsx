'use client';

import { useState } from 'react';
import { Workout, Exercise } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { WORKOUT_COLORS } from '@/lib/constants';

interface WorkoutDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (workout: Workout) => void;
  workout?: Workout;
}

export function WorkoutDialog({ open, onClose, onSave, workout }: WorkoutDialogProps) {
  const [name, setName] = useState(workout?.name || '');
  const [day, setDay] = useState(workout?.day || '');
  const [color, setColor] = useState(workout?.color || WORKOUT_COLORS[0]);
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises || []);

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: 3,
      reps: '8-12',
      weight: 0,
    };
    setExercises([...exercises, newExercise]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleUpdateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSave = () => {
    if (!name || !day || exercises.length === 0) return;

    const newWorkout: Workout = {
      id: workout?.id || Date.now().toString(),
      name,
      day,
      color,
      exercises,
    };

    onSave(newWorkout);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workout ? 'Editar Treino' : 'Novo Treino'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Treino</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino A - Peito e Tríceps"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Dia da Semana</Label>
            <Input
              id="day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="Ex: Segunda-feira"
            />
          </div>

          <div className="space-y-2">
            <Label>Cor do Treino</Label>
            <div className="flex gap-2 flex-wrap">
              {WORKOUT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${c} ${color === c ? 'ring-4 ring-gray-400' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Exercícios</Label>
              <Button onClick={handleAddExercise} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Exercício {index + 1}</span>
                  <Button
                    onClick={() => handleRemoveExercise(exercise.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <Input
                  value={exercise.name}
                  onChange={(e) => handleUpdateExercise(exercise.id, 'name', e.target.value)}
                  placeholder="Nome do exercício"
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Séries</Label>
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => handleUpdateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reps</Label>
                    <Input
                      value={exercise.reps}
                      onChange={(e) => handleUpdateExercise(exercise.id, 'reps', e.target.value)}
                      placeholder="8-12"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Peso (kg)</Label>
                    <Input
                      type="number"
                      value={exercise.weight || ''}
                      onChange={(e) => handleUpdateExercise(exercise.id, 'weight', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
