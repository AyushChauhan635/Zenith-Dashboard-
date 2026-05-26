import React from 'react';
import { Task, StudySubject, StudyLog, FoodItem, WaterLog, WorkoutLog, Alarm } from '../types';
import { PremiumAreaChart, CircularRingProgress } from './PremiumCharts';
import {
  Sparkles,
  BookOpen,
  Dumbbell,
  Apple,
  Clock,
  CheckCircle,
  TrendingUp,
  Flame,
  Droplet,
  BellRing,
} from 'lucide-react';

interface OverviewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  subjects: StudySubject[];
  studyLogs: StudyLog[];
  foodLogs: FoodItem[];
  waterLogs: WaterLog[];
  workoutLogs: WorkoutLog[];
  alarms: Alarm[];
  setCurrentTab: (tab: string) => void;
  dailyGoalCalories: number;
  dailyGoalWaterMl: number;
}

export const Overview: React.FC<OverviewProps> = ({
  tasks,
  setTasks,
  subjects,
  studyLogs,
  foodLogs,
  waterLogs,
  workoutLogs,
  alarms,
  setCurrentTab,
  dailyGoalCalories,
  dailyGoalWaterMl,
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);

  // Today calculations
  const totalStudyMinutesToday = studyLogs
    .filter((l) => l.date === todayStr)
    .reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalStudyHoursToday = (totalStudyMinutesToday / 60).toFixed(1);

  const totalCaloriesLoggedToday = foodLogs
    .filter((f) => f.date === todayStr)
    .reduce((acc, f) => acc + f.calories, 0);

  const totalWaterLoggedTodayMl = waterLogs
    .filter((w) => w.date === todayStr)
    .reduce((acc, w) => acc + w.amountMl, 0);

  const todaysCompletedWorkouts = workoutLogs.filter((w) => w.date === todayStr).length;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 105) : 0; // slight scale for visuals

  // Dynamic system recommendations based on current metrics
  const getSystemAdvice = () => {
    if (totalCaloriesLoggedToday === 0 && totalStudyMinutesToday === 0) {
      return "☀️ Welcome back! Let's power up. Pin a focus session in Study Hub, log your breakfast, and review today's pending core tasks.";
    }
    if (totalWaterLoggedTodayMl < 1000) {
      return "💧 Hydration warning: Log a couple of water glasses in Nutrition & Macros to maintain high concentration and metabolism.";
    }
    if (totalStudyMinutesToday > 120 && todaysCompletedWorkouts === 0) {
      return "🏋️‍♂️ Long study streak completed! Great job. Plan a 45 min physical gym workout routine templates session next to boost endorphins.";
    }
    return "🔥 Splendid pace! You are tracking tasks, meals, workouts, and study timings continuously. Maintain the positive streak.";
  };

  // Compile combined study metrics for 7-day progress curves
  const getAnalyticalData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().substring(0, 10);
      return {
        dateStr,
        dayOfWeek: days[d.getDay()],
        minutes: 0,
        calories: 0,
      };
    });

    studyLogs.forEach((log) => {
      const match = daysData.find((day) => day.dateStr === log.date);
      if (match) {
        match.minutes += log.durationMinutes;
      }
    });

    foodLogs.forEach((food) => {
      const match = daysData.find((day) => day.dateStr === food.date);
      if (match) {
        match.calories += food.calories;
      }
    });

    // We can show study hours specifically as graph curves
    return daysData.map((d) => ({
      label: d.dayOfWeek,
      value: Number((d.minutes / 60).toFixed(1)),
    }));
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="space-y-6" id="overview-dashboard-panel">
      {/* Dynamic Greetings Card */}
      <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-3xl rounded-full" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-4 h-4 animate-bounce shrink-0" />
            </span>
            <span className="text-xs font-bold text-indigo-400 font-mono tracking-wider uppercase">
              ZENITH DYNAMIC RECOMMENDATION
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight pt-1">
            Core Target Advice
          </h2>
          <p className="text-xs text-slate-350 leading-relaxed max-w-xl">
            {getSystemAdvice()}
          </p>
        </div>

        <div className="px-4 py-2.5 bg-indigo-950/20 rounded-xl border border-indigo-900/40 z-10 shrink-0 self-stretch md:self-auto flex flex-col justify-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-mono text-center md:text-left">
            Current Day (UTC)
          </span>
          <span className="text-sm font-extrabold text-slate-100 font-mono tracking-tight mt-0.5 text-center md:text-left">
            {new Date().toISOString().substring(0, 10)}
          </span>
        </div>
      </div>

      {/* Metrics Circular gauges grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setCurrentTab('studies')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-sky-500/30 transition-all cursor-pointer group shadow"
        >
          <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/15 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
              Study Hub Today
            </span>
            <span className="text-lg font-extrabold text-white block mt-0.5 tracking-tight font-mono">
              {totalStudyHoursToday} Hrs
            </span>
            <span className="text-[9px] text-slate-450 block italic">Tap to log</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentTab('workouts')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 transition-all cursor-pointer group shadow"
        >
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/15 group-hover:scale-105 transition-transform font-bold">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
              Workout Sessions
            </span>
            <span className="text-lg font-extrabold text-white block mt-0.5 tracking-tight font-mono">
              {todaysCompletedWorkouts} Sets
            </span>
            <span className="text-[9px] text-slate-450 block italic">Tap to routine</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentTab('nutrition')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-all cursor-pointer group shadow"
        >
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/15 group-hover:scale-105 transition-transform">
            <Apple className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
              Energy Counter
            </span>
            <span className="text-lg font-extrabold text-white block mt-0.5 tracking-tight font-mono">
              {totalCaloriesLoggedToday} kcal
            </span>
            <span className="text-[9px] text-slate-450 block italic">Target: {dailyGoalCalories}</span>
          </div>
        </div>

        <div
          onClick={() => setCurrentTab('nutrition')}
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-cyan-500/30 transition-all cursor-pointer group shadow"
        >
          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/15 group-hover:scale-105 transition-transform">
            <Droplet className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
              Hydration Water
            </span>
            <span className="text-lg font-extrabold text-white block mt-0.5 tracking-tight font-mono">
              {totalWaterLoggedTodayMl} ml
            </span>
            <span className="text-[9px] text-slate-450 block italic">Target: {dailyGoalWaterMl} ml</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Progress area charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                This Week's Study Progress Curve (Hrs Logged)
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2 py-0.5 rounded uppercase">
                AUTOMATED SYNCED
              </span>
            </div>
            <PremiumAreaChart data={getAnalyticalData()} height={170} colorTheme="indigo" valueSuffix="hrs" />
          </div>

          {/* Quick task lists & Active Alarm triggers notification strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-3 border-b border-slate-850 pb-2">
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  Today's Pending Checklist ({pendingTasks.length})
                </h3>

                {pendingTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-10 text-center">
                    All tasks completed! Reset list in Task List to verify streaks.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1">
                    {pendingTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 rounded-lg border border-slate-900 flex items-center gap-2.5 text-xs cursor-pointer select-none transition-all"
                      >
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-700 group-hover:border-slate-500 shrink-0" />
                        <span className="text-slate-200 font-semibold truncate flex-1 block">
                          {task.text}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded font-mono">
                          {task.category.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setCurrentTab('todos')}
                className="w-full mt-4 text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Go to Task board
              </button>
            </div>

            {/* Quick adding options */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-3 border-b border-slate-850 pb-2">
                  ⚡ Dynamic Quick Actions
                </h3>
                <div className="space-y-3 pt-1">
                  <button
                    onClick={() => setCurrentTab('studies')}
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-900 hover:border-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between"
                  >
                    <span>🎯 Start 25M Focus Pomodoro</span>
                    <span className="font-mono text-indigo-400 pr-1">→</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('nutrition')}
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-900 hover:border-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between"
                  >
                    <span>🥛 Log Glass of Water</span>
                    <span className="font-mono text-cyan-400 pr-1">+250ml</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-[10px] text-slate-500 italic mt-4">
                Tip: Logs persist locally on your system. Run Pomodoro sessions & track hydration glass additions to increment totals.
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Alarms indicators notification strip */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-rose-400" />
                  Tuned Alarms Reminders
                </h3>
                <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/10 px-2 py-0.5 rounded">
                  {alarms.filter((a) => a.active).length} ON
                </span>
              </div>

              {alarms.length === 0 ? (
                <div className="text-center py-10 hover:border-slate-800 transition-colors border border-dashed border-slate-850 rounded-xl">
                  <span className="text-xs text-slate-500 block italic">No configured alarm reminder lists.</span>
                  <button
                    onClick={() => setCurrentTab('alarms')}
                    className="mt-3 text-xs bg-slate-950 border border-slate-850 text-indigo-400 font-bold px-3 py-1.5 rounded-lg hover:border-slate-700"
                  >
                    Set reminder alarms
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {alarms.map((alarm) => (
                    <div
                      key={alarm.id}
                      className={`p-3 bg-slate-950 rounded-xl border flex justify-between items-center text-xs transition-all ${
                        alarm.active
                          ? 'border-slate-900/40 opacity-100'
                          : 'border-slate-900 opacity-40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm font-mono tracking-tight text-white leading-none">
                            {alarm.time}
                          </span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.3 bg-slate-900 text-slate-400 uppercase tracking-wider rounded border border-slate-800">
                            {alarm.category}
                          </span>
                        </div>
                        <span className="text-[10px] block text-slate-450 truncate max-w-[140px] mt-1 font-semibold">
                          {alarm.label}
                        </span>
                      </div>

                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        {alarm.active ? 'Armed' : 'Disarmed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setCurrentTab('alarms')}
              className="w-full mt-5 bg-slate-950 hover:bg-slate-850 text-slate-350 text-xs font-bold py-2 rounded-xl text-center border border-slate-850 cursor-pointer"
            >
              Configure Alarm Timings
            </button>
          </div>

          {/* Core App Streak visual indicator card */}
          <div className="p-5 bg-gradient-to-br from-indigo-950/20 to-violet-950/15 border border-indigo-900/35 rounded-2xl shadow-lg flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-xl pointer-events-none rounded-full" />
            <div className="space-y-1 z-10">
              <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase font-mono block">
                Total Goal Streak Counter
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                7 Days Achieved!
              </h3>
              <p className="text-[10px] text-slate-400 italic">
                Log items continuously inside your dashboard today to secure extra progress marks!
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 shrink-0 z-10">
              <Flame className="w-6 h-6 animate-pulse text-indigo-400" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
