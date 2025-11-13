'use client';

import { useState } from 'react';
import { Goal } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: Goal) => void;
}

export function GoalDialog({ open, onClose, onSave }: GoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState(0);
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSave = () => {
    if (!title || !unit || target <= 0) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      description,
      target,
      current: 0,
      unit,
      deadline: deadline || undefined,
      completed: false,
    };

    onSave(newGoal);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTarget(0);
    setUnit('');
    setDeadline('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Meta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ganhar massa muscular"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sua meta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Meta</Label>
              <Input
                id="target"
                type="number"
                value={target || ''}
                onChange={(e) => setTarget(parseFloat(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, treinos, etc"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Criar Meta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
