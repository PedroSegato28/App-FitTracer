'use client';

import { WorkoutHistory, UserStats } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  Calendar,
  Award,
  Star,
  Zap
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface EvolutionStatsProps {
  history: WorkoutHistory[];
  stats: UserStats;
}

export function EvolutionStats({ history, stats }: EvolutionStatsProps) {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getLevelInfo = (level: number) => {
    const levels = [
      { level: 1, name: 'Iniciante', color: 'from-gray-400 to-gray-500', icon: '🥉' },
      { level: 2, name: 'Aprendiz', color: 'from-blue-400 to-blue-500', icon: '🥈' },
      { level: 3, name: 'Intermediário', color: 'from-purple-400 to-purple-500', icon: '🥇' },
      { level: 4, name: 'Avançado', color: 'from-orange-400 to-orange-500', icon: '🏆' },
      { level: 5, name: 'Expert', color: 'from-red-400 to-red-500', icon: '👑' },
      { level: 6, name: 'Mestre', color: 'from-yellow-400 to-yellow-500', icon: '⭐' },
      { level: 7, name: 'Lenda', color: 'from-pink-400 to-pink-500', icon: '💎' },
    ];
    return levels[Math.min(level - 1, levels.length - 1)];
  };

  const levelInfo = getLevelInfo(stats.level);
  const pointsToNextLevel = stats.level * 100;
  const currentLevelProgress = (stats.totalPoints % 100);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-red-500 to-orange-500';
    if (streak >= 14) return 'from-orange-500 to-yellow-500';
    if (streak >= 7) return 'from-yellow-500 to-green-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <Card className={`p-6 bg-gradient-to-br ${levelInfo.color} text-white`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Nível</span>
            </div>
            <span className="text-2xl">{levelInfo.icon}</span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.level}</p>
          <p className="text-sm opacity-90">{levelInfo.name}</p>
          <div className="mt-3">
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-white transition-all duration-300"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>
            <p className="text-xs mt-1 opacity-75">
              {currentLevelProgress}/{pointsToNextLevel} XP
            </p>
          </div>
        </Card>

        {/* Total Points */}
        <Card className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Pontos Totais</span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalPoints}</p>
          <p className="text-sm opacity-90">XP acumulado</p>
        </Card>

        {/* Current Streak */}
        <Card className={`p-6 bg-gradient-to-br ${getStreakColor(stats.currentStreak)} text-white`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Sequência Atual</span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.currentStreak}</p>
          <p className="text-sm opacity-90">dias consecutivos</p>
        </Card>

        {/* Weekly Frequency */}
        <Card className="p-6 bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Frequência Semanal</span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.weeklyFrequency}</p>
          <p className="text-sm opacity-90">treinos/semana</p>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Conquistas</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className={`p-4 rounded-lg text-center ${stats.totalWorkouts >= 1 ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-500' : 'bg-gray-100 opacity-50'}`}>
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs font-semibold text-gray-700">Primeiro Treino</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.totalWorkouts >= 10 ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-500' : 'bg-gray-100 opacity-50'}`}>
            <div className="text-2xl mb-1">💪</div>
            <p className="text-xs font-semibold text-gray-700">10 Treinos</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.currentStreak >= 7 ? 'bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-500' : 'bg-gray-100 opacity-50'}`}>
            <div className="text-2xl mb-1">🔥</div>
            <p className="text-xs font-semibold text-gray-700">7 Dias Seguidos</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.totalWorkouts >= 50 ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-500' : 'bg-gray-100 opacity-50'}`}>
            <div className="text-2xl mb-1">⭐</div>
            <p className="text-xs font-semibold text-gray-700">50 Treinos</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${stats.totalPoints >= 500 ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-500' : 'bg-gray-100 opacity-50'}`}>
            <div className="text-2xl mb-1">👑</div>
            <p className="text-xs font-semibold text-gray-700">500 Pontos</p>
          </div>
        </div>
      </Card>

      {/* Workout History Table */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-900">Histórico de Treinos</h3>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum treino concluído ainda</p>
            <p className="text-sm text-gray-400 mt-2">Complete seu primeiro treino para ver o histórico</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Treino</TableHead>
                  <TableHead className="text-center">Exercícios</TableHead>
                  <TableHead className="text-center">Conclusão</TableHead>
                  <TableHead className="text-center">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.map((record) => {
                  const completionRate = (record.completedExercises / record.totalExercises) * 100;
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-sm">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{record.workoutName}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-gray-600">
                          {record.completedExercises}/{record.totalExercises}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={completionRate === 100 ? "default" : "secondary"}
                          className={completionRate === 100 ? "bg-green-500" : ""}
                        >
                          {Math.round(completionRate)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-gray-900">+{record.points}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
