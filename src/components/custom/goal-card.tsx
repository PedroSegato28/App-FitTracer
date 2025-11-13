'use client';

import { Goal } from '@/lib/types';
import { Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface GoalCardProps {
  goal: Goal;
  onUpdate: (id: string, current: number) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const progress = (goal.current / goal.target) * 100;
  const isCompleted = goal.current >= goal.target;

  return (
    <Card className="p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Target className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">{goal.title}</h3>
            <p className="text-sm text-gray-500">{goal.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progresso</span>
          <span className="font-semibold text-gray-900">
            {goal.current} / {goal.target} {goal.unit}
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />

        {goal.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate(goal.id, Math.max(0, goal.current - 1))}
            disabled={goal.current <= 0}
            className="flex-1"
          >
            -
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onUpdate(goal.id, goal.current + 1)}
            disabled={isCompleted}
            className="flex-1"
          >
            +
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(goal.id)}
          >
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  );
}
