import React, { useState } from 'react';
import { Exercise, WorkoutRoutine, WorkoutLog } from '../types';
import { PremiumBarChart } from './PremiumCharts';
import {
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Calendar,
  RotateCcw,
  Sparkles,
  Award,
  TrendingUp,
  History,
} from 'lucide-react';

interface WorkoutPlannerProps {
  routines: WorkoutRoutine[];
  setRoutines: React.Dispatch<React.SetStateAction<WorkoutRoutine[]>>;
  workoutLogs: WorkoutLog[];
  setWorkoutLogs: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
}

export const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({
  routines,
  setRoutines,
  workoutLogs,
  setWorkoutLogs,
}) => {
  // Routine Creator inputs
  const [routineName, setRoutineName] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  
  // Exercise inputs for selected routine
  const [execName, setExecName] = useState('');
  const [execSets, setExecSets] = useState(3);
  const [execReps, setExecReps] = useState(10);
  const [execWeight, setExecWeight] = useState(40);

  // Active workout tracking duration
  const [activeDuration, setActiveDuration] = useState(45);

  // New Smart freeform workout plan importer
  const [importText, setImportText] = useState('');
  const [showImporter, setShowImporter] = useState(false);
  const [importError, setImportError] = useState('');

  const parseCustomPlanText = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let parsedRoutineName = 'My Custom Routine';
    const firstLine = lines[0];
    const isExerciseLine = /\d+|sets|reps/i.test(firstLine);
    let exerciseStartIdx = 0;

    if (!isExerciseLine && firstLine.length < 50) {
      parsedRoutineName = firstLine.replace(/^[-*#\s]+/, '');
      exerciseStartIdx = 1;
    }

    const exercises: Exercise[] = [];
    for (let i = exerciseStartIdx; i < lines.length; i++) {
      const line = lines[i];
      const cleanLine = line.replace(/^[-*#\s\d.]+\s*/, '').trim();
      if (!cleanLine) continue;

      let sets = 3;
      let reps = 12;
      let weight = 0;

      // Extract weight (e.g. "@ 60kg", "60kg", "60 lbs", "@ 65")
      const weightMatch = cleanLine.match(/(?:@|at|\s+)\s*(\专\d+|\d+(?:\.\d+)?)\s*(?:kg|lbs|pounds)?/i) || cleanLine.match(/(\d+(?:\.\d+)?)\s*(?:kg|lbs)/i);
      if (weightMatch) {
         weight = Math.round(parseFloat(weightMatch[1]));
      }

      // Extract sets/reps (e.g. "4x10", "4 sets of 12 reps")
      const setsRepsMatch = cleanLine.match(/(\d+)\s*x\s*(\d+)/i) || cleanLine.match(/(\d+)\s*sets?(?:\s*of\s*|\s+)(\d+)\s*reps?/i);
      if (setsRepsMatch) {
        sets = parseInt(setsRepsMatch[1]);
        reps = parseInt(setsRepsMatch[2]);
      }

      // Strip sets and reps and weights from the name
      let name = cleanLine;
      name = name.replace(/(?:@|at|\s+)\s*\d+(?:\.\d+)?\s*(?:kg|lbs|pounds)?/gi, '');
      name = name.replace(/\d+\s*x\s*\d+/gi, '');
      name = name.replace(/\d+\s*sets?(?:\s*of\s*|\s+)\d+\s*reps?/gi, '');
      name = name.trim().replace(/[-:,;]+$/, '').trim();

      if (!name) name = 'Exercise';

      exercises.push({
        id: crypto.randomUUID(),
        name,
        sets,
        reps,
        weight,
        completed: false,
      });
    }

    return {
      id: crypto.randomUUID(),
      name: parsedRoutineName,
      exercises,
    };
  };

  const handleImportText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      const parsed = parseCustomPlanText(importText);
      if (!parsed || parsed.exercises.length === 0) {
        setImportError('Could not find any exercise cards in the text format provided. Make sure each exercise is on a new line!');
        return;
      }
      setRoutines((prev) => [...prev, parsed]);
      setSelectedRoutineId(parsed.id);
      setImportText('');
      setImportError('');
      setShowImporter(false);
      alert(`🎉 Parsed & loaded custom split "${parsed.name}" with ${parsed.exercises.length} exercises successfully!`);
    } catch (err) {
      setImportError('Failed to parse text. Format suggestions: "Bench Press 4x10 @ 60kg"');
    }
  };

  const handleLoadPreset = (presetType: string) => {
    let presetRoutine: WorkoutRoutine;
    if (presetType === 'Push') {
      presetRoutine = {
        id: crypto.randomUUID(),
        name: 'Power Push Split',
        exercises: [
          { id: crypto.randomUUID(), name: 'Barbell Flat Bench Press', sets: 4, reps: 8, weight: 65, completed: false },
          { id: crypto.randomUUID(), name: 'Incline Dumbbell Flyes', sets: 3, reps: 12, weight: 16, completed: false },
          { id: crypto.randomUUID(), name: 'Standing Overhead Barbell Press', sets: 4, reps: 10, weight: 35, completed: false },
          { id: crypto.randomUUID(), name: 'Dumbbell Lateral Raises', sets: 3, reps: 15, weight: 10, completed: false },
          { id: crypto.randomUUID(), name: 'Rope Triceps Pushdowns', sets: 3, reps: 12, weight: 20, completed: false }
        ]
      };
    } else if (presetType === 'Pull') {
      presetRoutine = {
        id: crypto.randomUUID(),
        name: 'Hypertrophy Pull Split',
        exercises: [
          { id: crypto.randomUUID(), name: 'Lat Pulldowns (Wide Grip)', sets: 4, reps: 10, weight: 55, completed: false },
          { id: crypto.randomUUID(), name: 'Chest Supported Dumbbell Row', sets: 3, reps: 10, weight: 22, completed: false },
          { id: crypto.randomUUID(), name: 'Barbell Shrugs', sets: 3, reps: 12, weight: 60, completed: false },
          { id: crypto.randomUUID(), name: 'Incline Alternating Bicep Curls', sets: 3, reps: 12, weight: 14, completed: false },
          { id: crypto.randomUUID(), name: 'Hammer Curls', sets: 3, reps: 12, weight: 16, completed: false }
        ]
      };
    } else {
      presetRoutine = {
        id: crypto.randomUUID(),
        name: 'Legs & Core Burner',
        exercises: [
          { id: crypto.randomUUID(), name: 'Barbell Back Squats', sets: 4, reps: 8, weight: 80, completed: false },
          { id: crypto.randomUUID(), name: 'Romanian Deadlifts (RDL)', sets: 3, reps: 10, weight: 70, completed: false },
          { id: crypto.randomUUID(), name: 'Standing Calf Raises', sets: 4, reps: 15, weight: 50, completed: false },
          { id: crypto.randomUUID(), name: 'Hanging Leg Raises', sets: 3, reps: 15, weight: 0, completed: false }
        ]
      };
    }

    setRoutines((prev) => [...prev, presetRoutine]);
    setSelectedRoutineId(presetRoutine.id);
    alert(`⚡ Loaded preset workout split: "${presetRoutine.name}" successfully!`);
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim()) return;

    const newRoutine: WorkoutRoutine = {
      id: crypto.randomUUID(),
      name: routineName.trim(),
      exercises: [],
    };

    setRoutines((prev) => [...prev, newRoutine]);
    setRoutineName('');
    setSelectedRoutineId(newRoutine.id);
  };

  const handleDeleteRoutine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    if (selectedRoutineId === id) {
      setSelectedRoutineId('');
    }
  };

  const handleAddExerciseToRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoutineId || !execName.trim()) return;

    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: execName.trim(),
      sets: Number(execSets) || 3,
      reps: Number(execReps) || 12,
      weight: Number(execWeight) || 20,
      completed: false,
    };

    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === selectedRoutineId) {
          return { ...r, exercises: [...r.exercises, newExercise] };
        }
        return r;
      })
    );

    setExecName('');
  };

  const handleDeleteExercise = (routineId: string, exerciseId: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === routineId) {
          return {
            ...r,
            exercises: r.exercises.filter((ex) => ex.id !== exerciseId),
          };
        }
        return r;
      })
    );
  };

  const handleToggleExerciseCompleted = (routineId: string, exerciseId: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === routineId) {
          return {
            ...r,
            exercises: r.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
            ),
          };
        }
        return r;
      })
    );
  };

  const handleLogActiveWorkout = (routine: WorkoutRoutine) => {
    if (routine.exercises.length === 0) {
      alert('⚠️ Cannot log nutrition or empty routines. First add exercises to this plan!');
      return;
    }

    const completedExercises = routine.exercises.filter((ex) => ex.completed);
    if (completedExercises.length === 0) {
      if (!confirm('No exercises are flagged as completed. Log this workout anyway?')) {
        return;
      }
    }

    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      routineName: routine.name,
      exercises: [...routine.exercises],
      date: new Date().toISOString().substring(0, 10),
      durationMinutes: activeDuration,
    };

    setWorkoutLogs((prev) => [newLog, ...prev]);

    // Reset exercise completion tags
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === routine.id) {
          return {
            ...r,
            exercises: r.exercises.map((ex) => ({ ...ex, completed: false })),
          };
        }
        return r;
      })
    );

    alert(`💪 Heavy workout session "${routine.name}" logged successfully! Form added to visual stats.`);
  };

  const getWeekBarData = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const barData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().substring(0, 10);
      return {
        dateStr,
        dayLabel: weekdays[d.getDay()],
        exercisesCount: 0,
      };
    });

    workoutLogs.forEach((log) => {
      const match = barData.find((day) => day.dateStr === log.date);
      if (match) {
        // Increment weight or score. Let's trace exercises completed
        match.exercisesCount += log.exercises.length || 1;
      }
    });

    return barData.map((d) => ({
      label: d.dayLabel,
      value: d.exercisesCount,
    }));
  };

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId);
  const totalGymWorkouts = workoutLogs.length;

  return (
    <div className="space-y-6" id="workout-panel">
      {/* Top dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Dumbbell className="w-5.5 h-5.5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Logged Workouts
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {totalGymWorkouts} Sessions
              </h4>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded uppercase">
            ACTIVE
          </span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Award className="w-5.5 h-5.5 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Created Templates
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {routines.length} Splits
              </h4>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg max-h-[140px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <TrendingUp className="w-5.5 h-5.5 text-purple-400" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Splits Template Loaded
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
                {selectedRoutine ? selectedRoutine.name : 'No split selected'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Gym schedules splits & routine templates */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Gym Plan Template */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5 font-sans">
              <Plus className="w-4.5 h-4.5 text-emerald-400" />
              Create Workout Split Template
            </h3>
            <form onSubmit={handleAddRoutine} className="flex gap-2.5">
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="e.g. Push Split, Leg Destroyer"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-555 transition-colors text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Create
              </button>
            </form>
          </div>

          {/* Smart Plan Importer Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                Smart Plan Importer
              </h3>
              <button
                onClick={() => setShowImporter(!showImporter)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-all cursor-pointer"
              >
                {showImporter ? 'Hide Importer' : 'Import / Presets'}
              </button>
            </div>

            {showImporter ? (
              <div className="space-y-4 pt-1">
                {/* One Click Presets */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                    ⚡ Load Popular Splits Presets
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleLoadPreset('Push')}
                      className="py-1.5 px-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-[10px] text-slate-200 transition-colors font-semibold cursor-pointer"
                    >
                      Push Split
                    </button>
                    <button
                      onClick={() => handleLoadPreset('Pull')}
                      className="py-1.5 px-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-[10px] text-slate-200 transition-colors font-semibold cursor-pointer"
                    >
                      Pull Split
                    </button>
                    <button
                      onClick={() => handleLoadPreset('Legs')}
                      className="py-1.5 px-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-lg text-[10px] text-slate-200 transition-colors font-semibold cursor-pointer"
                    >
                      Legs Split
                    </button>
                  </div>
                </div>

                {/* Freeform Paste */}
                <div className="border-t border-slate-800/60 pt-3">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                    📝 Paste Workout Plan Text
                  </label>
                  <p className="text-[9px] text-slate-500 leading-normal mb-2">
                    Enter any text (e.g. Back Day, Pullups 4x10 @ 0kg). We'll automatically parse exercises, sets, reps, and weights!
                  </p>
                  <form onSubmit={handleImportText} className="space-y-2">
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder={`Push Day\nBench Press 4x8 @ 70kg\nShoulder Press 3x10 @ 20kg\nTricep Pushdown 3x12 @ 15kg`}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                    />
                    {importError && (
                      <p className="text-[10px] text-rose-450 font-medium">{importError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={!importText.trim()}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-555 hover:to-teal-555 text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Parse & Import Personal Plan
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-550 leading-normal">
                Easily load popular splits or type / paste your custom routine in freeform text format above! We'll auto-extract exercises.
              </p>
            )}
          </div>

          {/* Load templates list */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3.5">Split Deck</h3>
            {routines.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                No custom split templates built.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {routines.map((r) => {
                  const isCurSelected = r.id === selectedRoutineId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoutineId(r.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isCurSelected
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-950/80 hover:border-slate-850'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{r.name}</h4>
                        <span className="text-[9px] font-mono text-slate-500">
                          {r.exercises.length} targeting exercise cards
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteRoutine(r.id, e)}
                        className="text-slate-600 hover:text-rose-450 p-1 rounded-md hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
                        title="Delete split"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Middle Columns: Exercises planner & consistency bar charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Create lists of exercises inside the routine */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg md:col-span-2 h-fit">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-4 border-b border-slate-800 pb-2">
                📂 Add Exercises to template
              </h3>

              {selectedRoutine ? (
                <form onSubmit={handleAddExerciseToRoutine} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                      Exercise Description name
                    </label>
                    <input
                      type="text"
                      value={execName}
                      onChange={(e) => setExecName(e.target.value)}
                      placeholder="e.g. Incline DB Bench Press"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[8px] text-slate-500 uppercase font-extrabold block mb-1">
                        Sets (num)
                      </label>
                      <input
                        type="number"
                        value={execSets}
                        onChange={(e) => setExecSets(Math.max(1, parseInt(e.target.value) || 3))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white uppercase text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-500 uppercase font-extrabold block mb-1">
                        Reps (range)
                      </label>
                      <input
                        type="number"
                        value={execReps}
                        onChange={(e) => setExecReps(Math.max(1, parseInt(e.target.value) || 12))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white uppercase text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-500 uppercase font-extrabold block mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={execWeight}
                        onChange={(e) => setExecWeight(Math.max(0, parseInt(e.target.value) || 20))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white uppercase text-center font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs rounded-xl mt-3 cursor-pointer"
                  >
                    Add to split templates
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-8">
                  Create or select a workspace split in the split deck first.
                </p>
              )}
            </div>

            {/* Workout Tracker execution list */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl md:col-span-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    📝 Live gym tracker
                  </h3>
                  {selectedRoutine && (
                    <span className="text-xs font-mono font-extrabold text-emerald-400">
                      Split: {selectedRoutine.name}
                    </span>
                  )}
                </div>

                {!selectedRoutine ? (
                  <p className="text-xs text-slate-500 italic text-center py-10">
                    Select a split profile on the left list to start tracking workout cards.
                  </p>
                ) : selectedRoutine.exercises.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-10">
                    No exercises added inside this workout template yet. Create exercise cards!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                    {selectedRoutine.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                          ex.completed
                            ? 'bg-slate-950/40 border-slate-900/60 opacity-60'
                            : 'bg-slate-950 border-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleToggleExerciseCompleted(selectedRoutine.id, ex.id)
                            }
                            className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                              ex.completed
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-slate-700 hover:border-slate-500 text-transparent hover:text-slate-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                          </button>

                          <div>
                            <span
                              className={`font-semibold block text-slate-100 ${
                                ex.completed ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {ex.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              Loads recommendation: {ex.sets} sets x {ex.reps} reps ({ex.weight}kg)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteExercise(selectedRoutine.id, ex.id)}
                          className="text-slate-600 hover:text-rose-450 p-1 rounded hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedRoutine && selectedRoutine.exercises.length > 0 && (
                <div className="mt-5 border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center justify-between py-1 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Est. Duration
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-slate-350">
                      <input
                        type="number"
                        value={activeDuration}
                        onChange={(e) => setActiveDuration(Math.max(5, parseInt(e.target.value) || 45))}
                        className="w-12 text-center font-mono font-bold text-white bg-slate-900 border border-slate-800 rounded px-1"
                      />
                      <span className="font-mono">mins</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLogActiveWorkout(selectedRoutine)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-555 transition-colors text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Log Completed Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Analytical summary graphics representation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                Workout Activity Charts (Completed Volume)
              </h3>
              <PremiumBarChart data={getWeekBarData()} height={150} colorTheme="emerald" valueSuffix="exercises" />
            </div>

            {/* Gym workout history log */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-slate-850 pb-2">
                  <History className="w-4.5 h-4.5 text-emerald-400" />
                  Gym History Logs
                </h3>

                {workoutLogs.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-10">
                    No workout sessions recorded yet. Start gym templates or exercises and tap "Log Completed Session" above.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1">
                    {workoutLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 bg-slate-950 rounded-lg flex justify-between items-center text-xs border border-slate-900"
                      >
                        <div>
                          <span className="font-extrabold text-slate-250">
                            {log.routineName}
                          </span>
                          <span className="text-[9px] block text-slate-500 font-mono">
                            {log.date} ({log.durationMinutes} mins timer)
                          </span>
                        </div>
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded font-mono">
                          {log.exercises.length} exercises
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {workoutLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear fitness history log?')) {
                      setWorkoutLogs([]);
                    }
                  }}
                  className="w-full mt-3 text-center text-[10px] text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Clear History Log
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
