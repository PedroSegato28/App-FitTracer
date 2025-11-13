'use client';

import { useState, useEffect } from 'react';
import { Workout, Goal, WorkoutHistory, UserStats } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_WORKOUTS, DEFAULT_GOALS, DAYS_OF_WEEK } from '@/lib/constants';
import { WorkoutCard } from '@/components/custom/workout-card';
import { GoalCard } from '@/components/custom/goal-card';
import { WorkoutDialog } from '@/components/custom/workout-dialog';
import { GoalDialog } from '@/components/custom/goal-dialog';
import { EvolutionStats } from '@/components/custom/evolution-stats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Dumbbell, 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp,
  Activity,
  Clock,
  BarChart3,
  Flame,
  Award,
  Zap
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', DEFAULT_WORKOUTS);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', DEFAULT_GOALS);
  const [workoutHistory, setWorkoutHistory] = useLocalStorage<WorkoutHistory[]>('workoutHistory', []);
  const [userStats, setUserStats] = useLocalStorage<UserStats>('userStats', {
    totalWorkouts: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    weeklyFrequency: 0
  });
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | undefined>();
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats
  useEffect(() => {
    if (mounted) {
      calculateStats();
    }
  }, [workoutHistory, mounted]);

  const calculateStats = () => {
    const totalWorkouts = workoutHistory.length;
    const totalPoints = workoutHistory.reduce((sum, h) => sum + h.points, 0);
    const level = Math.floor(totalPoints / 100) + 1;

    // Calculate streak
    const sortedHistory = [...workoutHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedHistory.forEach((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const diffDays = Math.floor((lastDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          if (sortedHistory.indexOf(record) === 0 || currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else if (diffDays > 1) {
          tempStreak = 1;
          if (sortedHistory.indexOf(record) === 0) {
            currentStreak = 0;
          }
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = recordDate;
    });

    // Calculate weekly frequency
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyWorkouts = workoutHistory.filter(h => 
      new Date(h.date) >= oneWeekAgo
    ).length;

    setUserStats({
      totalWorkouts,
      totalPoints,
      currentStreak,
      longestStreak,
      level,
      weeklyFrequency: weeklyWorkouts
    });
  };

  // Workout handlers
  const handleSaveWorkout = (workout: Workout) => {
    const exists = workouts.find(w => w.id === workout.id);
    if (exists) {
      setWorkouts(workouts.map(w => w.id === workout.id ? workout : w));
    } else {
      setWorkouts([...workouts, workout]);
    }
    setSelectedWorkout(undefined);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setWorkoutDialogOpen(true);
  };

  const handleToggleExercise = (workoutId: string, exerciseId: string) => {
    setWorkouts(workouts.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          exercises: w.exercises.map(e => 
            e.id === exerciseId ? { ...e, completed: !e.completed } : e
          )
        };
      }
      return w;
    }));
  };

  const handleStartWorkout = (workoutId: string) => {
    setWorkouts(workouts.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          inProgress: true,
          startedAt: new Date().toISOString(),
          exercises: w.exercises.map(e => ({ ...e, completed: false }))
        };
      }
      return w;
    }));
  };

  const handleFinishWorkout = (workoutId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const completedExercises = workout.exercises.filter(e => e.completed).length;
    const totalExercises = workout.exercises.length;
    const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) : 0;
    
    // Calculate points based on completion rate
    let points = 0;
    if (completionRate === 1) points = 50; // 100% completion
    else if (completionRate >= 0.8) points = 40; // 80%+
    else if (completionRate >= 0.6) points = 30; // 60%+
    else if (completionRate >= 0.4) points = 20; // 40%+
    else points = 10; // Any completion

    // Bonus points for streak
    if (userStats.currentStreak >= 7) points += 10;
    if (userStats.currentStreak >= 14) points += 20;
    if (userStats.currentStreak >= 30) points += 30;

    // Add to history
    const historyRecord: WorkoutHistory = {
      id: `history-${Date.now()}`,
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString(),
      exercises: workout.exercises,
      completedExercises,
      totalExercises,
      points
    };

    setWorkoutHistory([...workoutHistory, historyRecord]);

    // Reset workout
    setWorkouts(workouts.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          inProgress: false,
          startedAt: undefined
        };
      }
      return w;
    }));
  };

  const handleUpdateWeight = (workoutId: string, exerciseId: string, newWeight: number) => {
    setWorkouts(workouts.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          exercises: w.exercises.map(e => 
            e.id === exerciseId ? { ...e, weight: newWeight } : e
          )
        };
      }
      return w;
    }));
  };

  // Goal handlers
  const handleSaveGoal = (goal: Goal) => {
    setGoals([...goals, goal]);
  };

  const handleUpdateGoal = (id: string, current: number) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, current, completed: current >= g.target } : g
    ));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // Prevent hydration mismatch - render placeholder on server
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <header className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
                    <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    FitTracker Pro
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    Transforme seu corpo, supere seus limites
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
            <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
          </div>
        </main>
      </div>
    );
  }

  // Stats
  const totalExercises = workouts.reduce((acc, w) => acc + w.exercises.length, 0);
  const completedExercises = workouts.reduce((acc, w) => 
    acc + w.exercises.filter(e => e.completed).length, 0
  );
  const completedGoals = goals.filter(g => g.completed).length;
  const todayWorkout = workouts.find(w => w.day === DAYS_OF_WEEK[new Date().getDay()]);
  const activeWorkout = workouts.find(w => w.inProgress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FitTracker Pro
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Transforme seu corpo, supere seus limites
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Hoje</p>
              <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {DAYS_OF_WEEK[new Date().getDay()]}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/50">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">Treinos</p>
                <p className="text-xl sm:text-2xl font-black text-white">{workouts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border-purple-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/50">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">Exercícios</p>
                <p className="text-xl sm:text-2xl font-black text-white">{totalExercises}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/50">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">Progresso</p>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-orange-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/50">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">Metas</p>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {completedGoals}/{goals.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* User Level & Streak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-lg shadow-violet-500/50">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Nível Atual</p>
                <p className="text-3xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  {userStats.level}
                </p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/50">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Sequência Atual</p>
                <p className="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {userStats.currentStreak} dias
                </p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl shadow-lg shadow-yellow-500/50">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Pontos Totais</p>
                <p className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  {userStats.totalPoints}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Workout Alert */}
        {activeWorkout && (
          <Card className="relative overflow-hidden p-6 mb-6 sm:mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400/50 shadow-2xl shadow-emerald-500/50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Clock className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-white mb-1">Treino em Andamento</h3>
                  <p className="text-base sm:text-lg text-white/90 font-semibold">{activeWorkout.name}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Today's Workout Alert */}
        {todayWorkout && !activeWorkout && (
          <Card className="relative overflow-hidden p-6 mb-6 sm:mb-8 bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400/50 shadow-2xl shadow-cyan-500/50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl text-white mb-1">Treino de Hoje</h3>
                <p className="text-base sm:text-lg text-white/90 font-semibold">{todayWorkout.name}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
            <TabsTrigger 
              value="workouts" 
              className="flex items-center gap-2 py-3.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 transition-all duration-300"
            >
              <Dumbbell className="w-4 h-4" />
              <span className="text-sm sm:text-base font-bold">Treinos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className="flex items-center gap-2 py-3.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/50 transition-all duration-300"
            >
              <Target className="w-4 h-4" />
              <span className="text-sm sm:text-base font-bold">Metas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="evolution" 
              className="flex items-center gap-2 py-3.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm sm:text-base font-bold">Evolução</span>
            </TabsTrigger>
          </TabsList>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Meus Treinos
              </h2>
              <Button
                onClick={() => {
                  setSelectedWorkout(undefined);
                  setWorkoutDialogOpen(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Novo Treino</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>

            {workouts.length === 0 ? (
              <Card className="relative overflow-hidden p-12 sm:p-16 text-center bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl mb-6">
                    <Dumbbell className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                    Nenhum treino cadastrado
                  </h3>
                  <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-md mx-auto">
                    Comece sua jornada criando seu primeiro treino personalizado
                  </p>
                  <Button
                    onClick={() => setWorkoutDialogOpen(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 rounded-xl px-8 py-6 text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Primeiro Treino
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {workouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onEdit={handleEditWorkout}
                    onDelete={handleDeleteWorkout}
                    onToggleExercise={handleToggleExercise}
                    onStartWorkout={handleStartWorkout}
                    onFinishWorkout={handleFinishWorkout}
                    onUpdateWeight={handleUpdateWeight}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Minhas Metas
              </h2>
              <Button
                onClick={() => setGoalDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nova Meta</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>

            {goals.length === 0 ? (
              <Card className="relative overflow-hidden p-12 sm:p-16 text-center bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"></div>
                <div className="relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl mb-6">
                    <Target className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                    Nenhuma meta definida
                  </h3>
                  <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-md mx-auto">
                    Defina suas metas e acompanhe seu progresso rumo ao sucesso
                  </p>
                  <Button
                    onClick={() => setGoalDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 rounded-xl px-8 py-6 text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Primeira Meta
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Sua Evolução
              </h2>
            </div>
            <EvolutionStats history={workoutHistory} stats={userStats} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <WorkoutDialog
        open={workoutDialogOpen}
        onClose={() => {
          setWorkoutDialogOpen(false);
          setSelectedWorkout(undefined);
        }}
        onSave={handleSaveWorkout}
        workout={selectedWorkout}
      />

      <GoalDialog
        open={goalDialogOpen}
        onClose={() => setGoalDialogOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
}
