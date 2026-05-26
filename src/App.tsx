import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { StudyTracker } from './components/StudyTracker';
import { WorkoutPlanner } from './components/WorkoutPlanner';
import { NutritionTracker } from './components/NutritionTracker';
import { AlarmReminders, playSynthesizedAlarm } from './components/AlarmReminders';
import { TodoList } from './components/TodoList';
import { Task, StudySubject, StudyLog, WorkoutRoutine, WorkoutLog, FoodItem, WaterLog, Alarm, DailyGoal } from './types';
import { BellRing, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('overview');

  // Daily goals state
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => {
    const saved = localStorage.getItem('zenith_daily_goal');
    return saved ? JSON.parse(saved) : {
      calories: 2200,
      protein: 130,
      carbs: 230,
      fat: 70,
      waterMl: 2500
    };
  });

  // Task list states
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('zenith_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 't1', text: 'Revise chemistry chapter 2 notes on kinetics', completed: false, category: 'study', priority: 'high', dueDate: new Date().toISOString().substring(0,10) },
      { id: 't2', text: 'Log leg day workout volume splits', completed: true, category: 'workout', priority: 'medium', dueDate: new Date().toISOString().substring(0,10) },
      { id: 't3', text: 'Prepare high protein chicken salad lunchbox', completed: false, category: 'nutrition', priority: 'low', dueDate: new Date().toISOString().substring(0,10) },
      { id: 't4', text: 'Read paper on machine learning architectures', completed: false, category: 'study', priority: 'medium', dueDate: new Date().toISOString().substring(0,10) }
    ];
  });

  // Study tracker states
  const [subjects, setSubjects] = useState<StudySubject[]>(() => {
    const saved = localStorage.getItem('zenith_subjects');
    return saved ? JSON.parse(saved) : [
      { id: 's1', name: 'Organic Chemistry', targetHoursPerWeek: 8, color: '#6366f1', notes: 'Core Chapters:\n- Alcohols & Phenols\n- Aldehydes & Ketones' },
      { id: 's2', name: 'Machine Learning', targetHoursPerWeek: 12, color: '#10b981', notes: 'References:\n- Stanford CS229\n- Pattern Recognition textbook' },
      { id: 's3', name: 'Theoretical Physics', targetHoursPerWeek: 6, color: '#f59e0b', notes: 'Focus Areas:\n- Quantum harmonic oscillators\n- Wave mechanics logs' }
    ];
  });

  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(() => {
    const saved = localStorage.getItem('zenith_study_logs');
    if (saved) return JSON.parse(saved);

    // Seeding 7 days of realistic logs to populate area charts beautiful waves
    const today = new Date();
    const seed: StudyLog[] = [];
    for (let i = 0; i < 7; i++) {
      const logDate = new Date();
      logDate.setDate(today.getDate() - (6 - i));
      const dateStr = logDate.toISOString().substring(0, 10);
      
      // Seed study times between 1 to 4 hours per day
      const hrs = 1 + Math.random() * 3;
      seed.push({
        id: `seed-log-${i}`,
        subjectId: i % 2 === 0 ? 's1' : 's2',
        durationMinutes: Math.round(hrs * 60),
        date: dateStr,
        notes: 'Constructive research focus run completes.'
      });
    }
    return seed;
  });

  // Workout deck states
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    const saved = localStorage.getItem('zenith_routines');
    return saved ? JSON.parse(saved) : [
      {
        id: 'r1',
        name: 'Push Routine (Chest/Tri)',
        exercises: [
          { id: 'e1', name: 'Incline Dumbbell Bench Press', sets: 4, reps: 10, weight: 32, completed: false },
          { id: 'e2', name: 'Overhead Cable Triceps Extensions', sets: 3, reps: 12, weight: 18, completed: false },
          { id: 'e3', name: 'Decline Chest Press machine', sets: 3, reps: 12, weight: 65, completed: false }
        ]
      },
      {
        id: 'r2',
        name: 'Legs Hypertrophy Core',
        exercises: [
          { id: 'e4', name: 'Barbell Back Squats', sets: 4, reps: 8, weight: 85, completed: false },
          { id: 'e5', name: 'Seated Leg Curls', sets: 3, reps: 15, weight: 45, completed: false }
        ]
      }
    ];
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('zenith_workout_logs');
    if (saved) return JSON.parse(saved);

    const today = new Date();
    const seed: WorkoutLog[] = [];
    const exercisePool = [
      { id: 'seed-e1', name: 'Deadlifts', sets: 3, reps: 8, weight: 100, completed: true },
      { id: 'seed-e2', name: 'Pullups', sets: 3, reps: 12, weight: 0, completed: true },
      { id: 'seed-e3', name: 'Bicep curls', sets: 3, reps: 12, weight: 14, completed: true }
    ];

    // Seeding 4 workouts in previous days
    for (let i = 1; i <= 4; i++) {
      const logDate = new Date();
      logDate.setDate(today.getDate() - (i * 1.5));
      seed.push({
        id: `seed-gym-${i}`,
        routineName: i % 2 === 0 ? 'Pull Routine' : 'Push Routine',
        exercises: exercisePool,
        date: logDate.toISOString().substring(0, 10),
        durationMinutes: 50
      });
    }
    return seed;
  });

  // Nutrition logs
  const [foodLogs, setFoodLogs] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('zenith_food_logs');
    const todayStr = new Date().toISOString().substring(0, 10);
    return saved ? JSON.parse(saved) : [
      { id: 'f1', name: 'Oatmeal with whey & dry almonds', calories: 420, protein: 32, carbs: 54, fat: 12, mealType: 'breakfast', date: todayStr },
      { id: 'f2', name: 'Grilled salmon steak with white rice', calories: 650, protein: 45, carbs: 65, fat: 18, mealType: 'lunch', date: todayStr }
    ];
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('zenith_water_logs');
    const todayStr = new Date().toISOString().substring(0, 10);
    return saved ? JSON.parse(saved) : [
      { id: 'w1', amountMl: 500, date: todayStr },
      { id: 'w2', amountMl: 250, date: todayStr },
      { id: 'w3', amountMl: 500, date: todayStr }
    ];
  });

  // Alarms remind setups
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('zenith_alarms');
    return saved ? JSON.parse(saved) : [
      { id: 'a1', label: '📚 Study pomodoro focus session', time: '09:00', active: true, repeatDays: [1,2,3,4,5], category: 'study', soundType: 'soothing' },
      { id: 'a2', label: '🥗 High Protein Gym Pre-fuel Lunch', time: '13:00', active: true, repeatDays: [0,1,2,3,4,5,6], category: 'meal', soundType: 'digital' },
      { id: 'a3', label: '💪 Heavy Powerlifting Workout Routine', time: '18:00', active: false, repeatDays: [1,3,5], category: 'workout', soundType: 'cosmic' }
    ];
  });

  // Triggered alarm overlay state
  const [activeTriggeredAlarm, setActiveTriggeredAlarm] = useState<Alarm | null>(null);
  const stopAlarmSoundRef = useRef<(() => void) | null>(null);
  const lastCheckedTimeRef = useRef<string>(''); // tracks last triggered minute

  // Synchronizers localStorage effects
  useEffect(() => {
    localStorage.setItem('zenith_daily_goal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('zenith_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('zenith_study_logs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem('zenith_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('zenith_workout_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('zenith_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('zenith_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('zenith_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Alarms ticker monitor
  useEffect(() => {
    const handleTicker = () => {
      const now = new Date();
      const currentHHMM = now.toISOString().substring(11, 16); // e.g. "08:52"
      const dayIndex = now.getDay(); // index 0-6

      if (currentHHMM === lastCheckedTimeRef.current) return;

      alarms.forEach((alarm) => {
        if (
          alarm.active &&
          alarm.time === currentHHMM &&
          alarm.repeatDays.includes(dayIndex)
        ) {
          lastCheckedTimeRef.current = currentHHMM;
          triggerAlarmAlert(alarm);
        }
      });
    };

    const interval = setInterval(handleTicker, 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  const triggerAlarmAlert = (alarm: Alarm) => {
    if (activeTriggeredAlarm) {
      // quiet past alarm first
      dismissActiveAlarm();
    }

    setActiveTriggeredAlarm(alarm);
    
    // Play synthesized Web Audio alerts infinitely
    const stopFn = playSynthesizedAlarm(alarm.soundType);
    stopAlarmSoundRef.current = stopFn;
  };

  const dismissActiveAlarm = () => {
    if (stopAlarmSoundRef.current) {
      stopAlarmSoundRef.current();
      stopAlarmSoundRef.current = null;
    }
    setActiveTriggeredAlarm(null);
  };

  // Render dynamic view selection
  const renderPanel = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <Overview
            tasks={tasks}
            setTasks={setTasks}
            subjects={subjects}
            studyLogs={studyLogs}
            foodLogs={foodLogs}
            waterLogs={waterLogs}
            workoutLogs={workoutLogs}
            alarms={alarms}
            setCurrentTab={setCurrentTab}
            dailyGoalCalories={dailyGoal.calories}
            dailyGoalWaterMl={dailyGoal.waterMl}
          />
        );
      case 'studies':
        return (
          <StudyTracker
            subjects={subjects}
            setSubjects={setSubjects}
            studyLogs={studyLogs}
            setStudyLogs={setStudyLogs}
          />
        );
      case 'workouts':
        return (
          <WorkoutPlanner
            routines={routines}
            setRoutines={setRoutines}
            workoutLogs={workoutLogs}
            setWorkoutLogs={setWorkoutLogs}
          />
        );
      case 'nutrition':
        return (
          <NutritionTracker
            foodLogs={foodLogs}
            setFoodLogs={setFoodLogs}
            waterLogs={waterLogs}
            setWaterLogs={setWaterLogs}
            dailyGoal={dailyGoal}
            setDailyGoal={setDailyGoal}
          />
        );
      case 'alarms':
        return (
          <AlarmReminders
            alarms={alarms}
            setAlarms={setAlarms}
          />
        );
      case 'todos':
        return (
          <TodoList
            tasks={tasks}
            setTasks={setTasks}
          />
        );
      default:
        return <div>View option not mapped.</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans" id="zenith-root-app">
      
      {/* Dynamic Alarm overlay modal */}
      {activeTriggeredAlarm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-3xl rounded-full" />
          
          <div className="space-y-6 max-w-md z-10">
            <div className="w-24 h-24 bg-rose-600/15 border-2 border-rose-500 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
              <BellRing className="w-12 h-12 text-rose-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase bg-rose-500/10 border border-rose-550/25 px-3 py-1 rounded-full">
                Reminder trigger
              </span>
              <h2 className="text-4xl font-black text-white tracking-tight pt-1">
                {activeTriggeredAlarm.time}
              </h2>
              <h3 className="text-lg font-bold text-slate-200">
                {activeTriggeredAlarm.label}
              </h3>
              <p className="text-xs text-slate-500 italic max-w-xs mx-auto">
                Synthesized oscillators are beating dynamically via Web Audio API. Quiet the speaker triggers by dismissing below.
              </p>
            </div>

            <button
              onClick={dismissActiveAlarm}
              className="w-full bg-rose-600 hover:bg-rose-550 transition-colors text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-rose-600/30"
            >
              <VolumeX className="w-5 h-5" />
              STRIKE REMINDER / QUIET TONE
            </button>
          </div>
        </div>
      )}

      {/* Primary navigation Drawer Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        appName="Zenith Sync"
      />

      {/* Core Layout container */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-h-screen space-y-4">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {currentTab === 'overview' && 'Master Central'}
              {currentTab === 'studies' && 'Study Hub'}
              {currentTab === 'workouts' && 'Workout Planner & Deck'}
              {currentTab === 'nutrition' && 'Fuel Tracker & Hydration'}
              {currentTab === 'alarms' && 'Time Sync & Alarms'}
              {currentTab === 'todos' && 'Task List Agenda'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Daily habits, goals, focus Pomodoros, calorie logs, water intake, and synthesised alarms.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-xs font-mono">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-slate-400">
              UTC Hour: <span className="font-bold text-white uppercase">{new Date().toISOString().substring(11, 16)}</span>
            </span>
          </div>
        </header>

        {/* Dynamic Panels */}
        <section className="animate-fade-in-up">
          {renderPanel()}
        </section>
      </main>

    </div>
  );
}
