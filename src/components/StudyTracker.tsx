import React, { useState, useEffect, useRef } from 'react';
import { StudySubject, StudyLog } from '../types';
import { PremiumAreaChart } from './PremiumCharts';
import { playSynthesizedAlarm } from './AlarmReminders';
import {
  BookOpen,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  BookMarked,
  Hourglass,
  CheckCircle,
  FileText,
  Clock,
  History,
} from 'lucide-react';

interface StudyTrackerProps {
  subjects: StudySubject[];
  setSubjects: React.Dispatch<React.SetStateAction<StudySubject[]>>;
  studyLogs: StudyLog[];
  setStudyLogs: React.Dispatch<React.SetStateAction<StudyLog[]>>;
}

export const StudyTracker: React.FC<StudyTrackerProps> = ({
  subjects,
  setSubjects,
  studyLogs,
  setStudyLogs,
}) => {
  // Subjects input
  const [subName, setSubName] = useState('');
  const [subTarget, setSubTarget] = useState(6);
  const [subColor, setSubColor] = useState('#6366f1');
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  
  // Notes editor
  const [notesText, setNotesText] = useState('');

  // Pomodoro Focus Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timerMinutes, setTimerMinutes] = useState(25); // customized focus mins
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Keep track of original duration for tracking progress ring
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(25 * 60);

  // Initialize selected subject Notes
  useEffect(() => {
    if (subjects.length > 0) {
      if (!selectedSubId) {
        setSelectedSubId(subjects[0].id);
        setNotesText(subjects[0].notes || '');
      } else {
        const found = subjects.find((s) => s.id === selectedSubId);
        if (found) {
          setNotesText(found.notes || '');
        }
      }
    } else {
      setSelectedSubId('');
      setNotesText('');
    }
  }, [selectedSubId, subjects]);

  // Pomodoro ticking effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, timerMode]);

  const handleTimerComplete = () => {
    // Play sound synthesizers
    const stopAudio = playSynthesizedAlarm('soothing');
    setTimeout(stopAudio, 5000); // sound alarm for 5 seconds

    if (timerMode === 'focus') {
      const minutesCompleted = Math.round(totalTimerSeconds / 60);
      
      // Auto register log if a subject is selected
      if (selectedSubId) {
        const newLog: StudyLog = {
          id: crypto.randomUUID(),
          subjectId: selectedSubId,
          durationMinutes: minutesCompleted,
          date: new Date().toISOString().substring(0, 10),
          notes: `Pomodoro Focus run complete!`,
        };
        setStudyLogs((prev) => [newLog, ...prev]);
        alert(`🏆 Focus timer complete! Logged ${minutesCompleted} mins to ${subjects.find(s => s.id === selectedSubId)?.name || 'Subject'}. Take a 5 min break.`);
      } else {
        alert('🏆 Focus timer complete! Good job focusing, take a 5 min break.');
      }
      
      // Toggle to break mode automatically
      setTimerMode('break');
      setTimeLeft(5 * 60);
      setTotalTimerSeconds(5 * 60);
    } else {
      alert('⚡ Break completed! Ready to buckle down for another Focus block?');
      setTimerMode('focus');
      setTimeLeft(25 * 60);
      setTotalTimerSeconds(25 * 60);
    }
  };

  const startStopTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    const mins = timerMode === 'focus' ? timerMinutes : 5;
    setTimeLeft(mins * 60);
    setTotalTimerSeconds(mins * 60);
  };

  const setTimerPreset = (mins: number, mode: 'focus' | 'break') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimerMinutes(mins);
    setTimeLeft(mins * 60);
    setTotalTimerSeconds(mins * 60);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const newSubject: StudySubject = {
      id: crypto.randomUUID(),
      name: subName.trim(),
      targetHoursPerWeek: subTarget,
      color: subColor,
      notes: '',
    };

    setSubjects((prev) => [...prev, newSubject]);
    setSubName('');
    setSubTarget(6);
    if (!selectedSubId) {
      setSelectedSubId(newSubject.id);
    }
  };

  const handleDeleteSubject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setStudyLogs((prev) => prev.filter((l) => l.subjectId !== id));
    if (selectedSubId === id) {
      setSelectedSubId('');
    }
  };

  const handleUpdateNotes = () => {
    if (!selectedSubId) return;
    setSubjects((prev) =>
      prev.map((s) => (s.id === selectedSubId ? { ...s, notes: notesText } : s))
    );
    alert('📝 Subject research notes saved successfully.');
  };

  // Convert studyLogs to 7 day chart data
  const getChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().substring(0, 10);
      return {
        dateStr,
        dayOfWeek: days[d.getDay()],
        minutes: 0,
      };
    });

    studyLogs.forEach((log) => {
      const match = daysData.find((day) => day.dateStr === log.date);
      if (match) {
        match.minutes += log.durationMinutes;
      }
    });

    return daysData.map((d) => ({
      label: d.dayOfWeek,
      value: Number((d.minutes / 60).toFixed(1)), // convert to hours
    }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate stats
  const totalHoursLogged = (studyLogs.reduce((acc, l) => acc + l.durationMinutes, 0) / 60).toFixed(1);
  const selectedSubject = subjects.find((s) => s.id === selectedSubId);
  
  const getHoursForSubject = (id: string) => {
    const mins = studyLogs
      .filter((l) => l.subjectId === id)
      .reduce((acc, l) => acc + l.durationMinutes, 0);
    return (mins / 60).toFixed(1);
  };

  const colorsPalette = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6" id="study-panel">
      {/* Top statistics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
              <BookOpen className="w-5.5 h-5.5 text-sky-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Total Study Logged
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {totalHoursLogged} Hours
              </h4>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <BookMarked className="w-5.5 h-5.5 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Active Subjects
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {subjects.length} Subjects
              </h4>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Hourglass className="w-5.5 h-5.5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Current Select Target
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {selectedSubject ? `${selectedSubject.targetHoursPerWeek} hrs/wk` : 'None select'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Subjects manager & creator */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Subject Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-indigo-400" />
              Add Subject Module
            </h3>
            <form onSubmit={handleAddSubject} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Subject Identifier
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Advanced Calculus, organic chemistry"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Hours target / Wk
                  </label>
                  <input
                    type="number"
                    value={subTarget}
                    onChange={(e) => setSubTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Color Icon Theme
                  </label>
                  <div className="flex flex-wrap gap-1.5 items-center mt-1">
                    {colorsPalette.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSubColor(col)}
                        className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                          subColor === col ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-xs font-bold py-2 rounded-xl cursor-pointer"
              >
                Create Subject
              </button>
            </form>
          </div>

          {/* Subjects Directory list */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3.5">Subjects Directory</h3>
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                No custom subject profiles created yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {subjects.map((s) => {
                  const isCurSelected = s.id === selectedSubId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSubId(s.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isCurSelected
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-950/80 hover:border-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                          style={{ backgroundColor: s.color }}
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{s.name}</h4>
                          <span className="text-[9px] font-mono text-slate-400">
                            Logged: {getHoursForSubject(s.id)} / {s.targetHoursPerWeek} hrs
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSubject(s.id, e)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors"
                        title="Delete Subject"
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

        {/* Center/Middle Column: Pomodoro Focus Timer Block & Subject Notes */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pomodoro Timer Visual Widget */}
            <div className="p-5 bg-indigo-950/25 border border-indigo-900/35 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase font-mono tracking-widest font-bold text-indigo-400">
                    Pomodoro Focus Engine
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-indigo-900/40">
                    {timerMode.toUpperCase()} MODE
                  </span>
                </div>

                {/* Big digital read-out */}
                <div className="text-center py-6 font-mono relative">
                  <div className="text-5xl font-extrabold text-white tracking-tight">
                    {formatTime(timeLeft)}
                  </div>
                  {/* Progress segment indicator */}
                  <div className="w-2/3 h-1 bg-indigo-950 rounded-full mx-auto mt-3 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-1000"
                      style={{
                        width: `${((totalTimerSeconds - timeLeft) / totalTimerSeconds) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Controls buttons list */}
                <div className="flex justify-center items-center gap-4.5 mt-2">
                  <button
                    onClick={resetTimer}
                    className="p-2.5 bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Reset focus"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={startStopTimer}
                    style={{ backgroundColor: isTimerRunning ? '#ec4899' : '#4f46e5' }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-105 cursor-pointer shadow-lg hover:shadow-indigo-500/10 transition-all font-bold"
                  >
                    {isTimerRunning ? (
                      <Pause className="w-5.5 h-5.5 fill-white" />
                    ) : (
                      <Play className="w-5.5 h-5.5 fill-white ml-0.5" />
                    )}
                  </button>

                  <div className="w-9" /> {/* gap balance */}
                </div>
              </div>

              {/* Preset buttons */}
              <div className="mt-5 border-t border-indigo-900/45 pt-4 flex gap-2">
                <button
                  onClick={() => setTimerPreset(25, 'focus')}
                  className="flex-1 py-1.5 text-[10px] uppercase font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-900/30 hover:border-indigo-700/60 rounded-lg transition-all"
                >
                  Focus (25m)
                </button>
                <button
                  onClick={() => setTimerPreset(50, 'focus')}
                  className="flex-1 py-1.5 text-[10px] uppercase font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-900/30 hover:border-indigo-700/60 rounded-lg transition-all"
                >
                  Heavy (50m)
                </button>
                <button
                  onClick={() => setTimerPreset(5, 'break')}
                  className="flex-1 py-1.5 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/35 border border-emerald-900/30 hover:border-emerald-700/60 rounded-lg transition-all"
                >
                  Break (5m)
                </button>
              </div>
            </div>

            {/* Subject Notes Notepad Section */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Subject Research / Notes
                  </h3>
                  {selectedSubject && (
                    <span
                      style={{ color: selectedSubject.color }}
                      className="text-[10px] font-bold font-mono"
                    >
                      {selectedSubject.name}
                    </span>
                  )}
                </div>

                {selectedSubId ? (
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Capture core concepts, study targets, reference books, formulas, or dynamic tasks here per subject."
                    rows={4}
                    className="w-full bg-slate-950 text-slate-200 placeholder-slate-600 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-mono resize-none leading-relaxed"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs py-10 italic">
                    Select a subject in the list to write study targets or notes.
                  </div>
                )}
              </div>

              {selectedSubId && (
                <button
                  onClick={handleUpdateNotes}
                  className="w-full mt-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save Notepad References
                </button>
              )}
            </div>
          </div>

          {/* Bottom Graph Segment representing study progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graph module */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Clock className="w-4.5 h-4.5 text-indigo-400" />
                Study Progress Curve (Hrs Logged)
              </h3>
              <PremiumAreaChart data={getChartData()} height={150} colorTheme="indigo" valueSuffix="hrs" />
            </div>

            {/* History listings */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-slate-850 pb-2">
                  <History className="w-4.5 h-4.5 text-indigo-400" />
                  Focus Logs History
                </h3>
                {studyLogs.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-8 text-center">
                    No logged sessions for this period. Run focus timers or enter logs to record progress.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {studyLogs.slice(0, 10).map((log) => {
                      const subject = subjects.find((s) => s.id === log.subjectId);
                      return (
                        <div
                          key={log.id}
                          className="p-2.5 bg-slate-950 rounded-lg flex justify-between items-center text-xs border border-slate-900"
                        >
                          <div>
                            <span className="font-bold text-slate-200">
                              {subject ? subject.name : 'Completed Focus'}
                            </span>
                            <span className="text-[9px] block text-slate-500 font-mono">
                              {log.date}
                            </span>
                          </div>
                          <span className="font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-2 py-0.5 rounded font-mono">
                            {log.durationMinutes} mins
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {studyLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear study progression logs history?')) {
                      setStudyLogs([]);
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
