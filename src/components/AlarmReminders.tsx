import React, { useState, useEffect, useRef } from 'react';
import { Alarm } from '../types';
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  Clock,
  Check,
  Calendar,
  Volume2,
  VolumeX,
} from 'lucide-react';

// Web Audio API Synthesizer
let activeAudioContext: AudioContext | null = null;
let synthInterval: any = null;

export const playSynthesizedAlarm = (soundType: string): (() => void) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return () => {};

    const ctx = new AudioContextClass();
    activeAudioContext = ctx;

    let tick = 0;
    const playTick = () => {
      if (ctx.state === 'closed') return;
      
      const now = ctx.currentTime;
      
      if (soundType === 'digital') {
        // Double digital bleeps
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(987.77, now + 0.2);
        
        gain2.gain.setValueAtTime(0.12, now + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.2);
        osc2.stop(now + 0.38);
      } else if (soundType === 'analog') {
        // Rich fire alarm ring
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.1);
        osc.frequency.linearRampToValueAtTime(440, now + 0.2);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (soundType === 'soothing') {
        // High quality dual sine bells (C-Major tone)
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        const bellFreq = notes[tick % notes.length];
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = bellFreq;
        
        osc2.type = 'sine';
        osc2.frequency.value = bellFreq * 2.01; // subtle ring detune

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.85);
        osc2.stop(now + 0.85);
      } else {
        // Cosmic synth sweep
        const baseFreq = 180 + Math.sin(tick) * 60;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.4);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      }

      tick++;
    };

    // Play immediately and repeat every second
    playTick();
    synthInterval = setInterval(playTick, 1000);

    return () => {
      if (synthInterval) clearInterval(synthInterval);
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    };
  } catch (err) {
    console.error('Failed to play synthesized alarm:', err);
    return () => {};
  }
};

interface AlarmRemindersProps {
  alarms: Alarm[];
  setAlarms: React.Dispatch<React.SetStateAction<Alarm[]>>;
}

export const AlarmReminders: React.FC<AlarmRemindersProps> = ({ alarms, setAlarms }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('08:00');
  const [category, setCategory] = useState<Alarm['category']>('general');
  const [soundType, setSoundType] = useState<Alarm['soundType']>('digital');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  
  // Audition synthesizer preview
  const [previewingSound, setPreviewingSound] = useState<string | null>(null);
  const stopPreviewRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleDay = (dayIndex: number) => {
    if (repeatDays.includes(dayIndex)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIndex));
    } else {
      setRepeatDays([...repeatDays, dayIndex].sort());
    }
  };

  const activeSoundPreview = (type: Alarm['soundType']) => {
    if (stopPreviewRef.current) {
      stopPreviewRef.current();
      stopPreviewRef.current = null;
    }
    
    if (previewingSound === type) {
      setPreviewingSound(null);
      return;
    }

    setPreviewingSound(type);
    const stopFn = playSynthesizedAlarm(type);
    stopPreviewRef.current = () => {
      stopFn();
      setPreviewingSound(null);
    };

    // Auto quiet test preview after 4 seconds
    setTimeout(() => {
      if (stopPreviewRef.current && previewingSound !== type) {
        // Avoid stopping if they clicked a different tone
        return;
      }
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
        stopPreviewRef.current = null;
      }
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (stopPreviewRef.current) {
        stopPreviewRef.current();
      }
    };
  }, []);

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    const newAlarm: Alarm = {
      id: crypto.randomUUID(),
      label: label.trim() || `${category.charAt(0).toUpperCase() + category.slice(1)} Alert`,
      time,
      active: true,
      repeatDays: repeatDays.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : repeatDays, // default to everyday if none selected
      category,
      soundType,
    };

    setAlarms((prev) => [newAlarm, ...prev]);
    setLabel('');
    setTime('08:00');
    setRepeatDays([]);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const categoryColor = (cat: Alarm['category']) => {
    switch (cat) {
      case 'study':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'workout':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'meal':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6" id="alarm-hub-panel">
      {/* Top Banner with live ticking clock */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex items-center gap-4.5">
          <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <Clock className="w-7 h-7 text-rose-400 animate-pulse" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-slate-400">
              System Time (UTC)
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {currentTime.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h2>
          </div>
        </div>

        <div className="bg-slate-950/40 px-6 py-4 rounded-2xl border border-slate-800 text-center font-mono">
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {currentTime.toISOString().substring(11, 19)}
          </span>
          <span className="text-[10px] block text-rose-400 tracking-widest font-bold uppercase mt-1">
            UTC REALTIME ENGINE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alarm creator form */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-1 shadow-xl">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-indigo-400" />
            Create Alert Pin
          </h3>

          <form onSubmit={handleAddAlarm} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Select Reminder Target Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-lg font-bold font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Reminder Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Protein shake weight-in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Alarm['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="general">🏋️‍♂️ General</option>
                  <option value="study">📚 Study Hub</option>
                  <option value="workout">💪 Gym Session</option>
                  <option value="meal">🥗 Fuel / Meal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Alarm Sound Tone
                </label>
                <select
                  value={soundType}
                  onChange={(e) => setSoundType(e.target.value as Alarm['soundType'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="digital">🎛️ Double Beep</option>
                  <option value="analog">🔔 Fire Ring</option>
                  <option value="soothing">🔔 Zen Bell</option>
                  <option value="cosmic">🌌 Cosmic Sweep</option>
                </select>
              </div>
            </div>

            {/* Alarm Preview Sound button */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400">
                Test audio synthesis
              </span>
              <button
                type="button"
                onClick={() => activeSoundPreview(soundType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  previewingSound === soundType
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {previewingSound === soundType ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-bounce" />
                    <span>Stop test</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Audition</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Repeat Days
              </label>
              <div className="flex justify-between gap-1">
                {daysOfWeek.map((day, idx) => {
                  const isSelected = repeatDays.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleDay(idx)}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      {day[0]}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 italic">
                Defaults to everyday if no specific days are highlighted.
              </p>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-center text-sm shadow-xl shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Dynamic Pin
            </button>
          </form>
        </div>

        {/* Alarm Lists Dashboard */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-2 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                Active Reminders ({alarms.length})
              </h3>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850">
                AUTOMATED SYNCED
              </span>
            </div>

            {alarms.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <BellRing className="w-12 h-12 stroke-[1.5] text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No configured alarm pins exist</p>
                <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                  Add alarm reminders to trigger sound synthesis alerts during study sessions, gyms, or meal diets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    id={`alarm-card-${alarm.id}`}
                    className={`p-4 rounded-xl border transition-all flex justify-between items-start ${
                      alarm.active
                        ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-750'
                        : 'bg-slate-900/60 border-slate-850 opacity-60'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-mono tracking-tight text-white">
                          {alarm.time}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${categoryColor(
                            alarm.category
                          )}`}
                        >
                          {alarm.category.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {alarm.label}
                      </h4>

                      <div className="flex flex-wrap gap-1">
                        {alarm.repeatDays.length === 7 ? (
                          <span className="text-[10px] font-mono text-indigo-400">
                            Every day
                          </span>
                        ) : (
                          alarm.repeatDays.map((col) => (
                            <span
                              key={col}
                              className="text-[9px] font-semibold font-mono bg-slate-900 text-slate-400 px-1 py-0.5 rounded-sm"
                            >
                              {daysOfWeek[col]}
                            </span>
                          ))
                        )}
                        <span className="text-[9px] font-mono text-slate-500 ml-1 italic block self-center">
                          ({alarm.soundType})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 self-stretch justify-between">
                      {/* Switch layout */}
                      <button
                        onClick={() => handleToggleActive(alarm.id)}
                        className={`w-9 cursor-pointer h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                          alarm.active ? 'bg-indigo-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            alarm.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => handleDeleteAlarm(alarm.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 cursor-pointer transition-colors"
                        title="Delete alarms"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-950/20 p-4 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[11px] text-slate-500 font-medium">
              Reminder sweeps run perpetually in the core browser thread. Audio synthesizers generate high-quality sound outputs safely behind cross-origin filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
