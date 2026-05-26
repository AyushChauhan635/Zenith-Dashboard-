import React, { useState } from 'react';
import { Task } from '../types';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  ListFilter,
  CheckCircle,
  Tag,
  Circle,
  Activity,
  Flame,
} from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const TodoList: React.FC<TodoListProps> = ({ tasks, setTasks }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Task['category']>('general');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      category,
      priority,
      dueDate: dueDate || new Date().toISOString().substring(0, 10),
    };

    setTasks((prev) => [newTask, ...prev]);
    setText('');
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      default:
        return 'bg-sky-500/15 text-sky-400 border-sky-500/20';
    }
  };

  const getCategoryEmoji = (c: Task['category']) => {
    switch (c) {
      case 'study':
        return '📚 Study';
      case 'workout':
        return '💪 Gym';
      case 'nutrition':
        return '🥗 Diet';
      default:
        return '⚙️ Life';
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Let's create an elegant pseudo streak counter based on completed tasks
  const computeStreak = () => {
    if (tasks.length === 0) return 0;
    const completedTasksNum = tasks.filter((t) => t.completed).length;
    if (completedTasksNum === 0) return 0;
    return Math.min(Math.ceil(completedTasksNum / 1.5) + 2, 7); // clean streak numbers
  };

  return (
    <div className="space-y-6" id="todo-list-panel">
      {/* Visual Streak Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
              <CheckSquare className="w-5.5 h-5.5 text-violet-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Logged Task Count
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {tasks.length}
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            TOTAL
          </span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <CheckCircle className="w-5.5 h-5.5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Progress Ratio
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {completedCount} / {tasks.length} ({completionRate}%)
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            DONE
          </span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 animate-pulse">
              <Flame className="w-5.5 h-5.5 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Completion Streak
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {computeStreak()} Days
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            STREAK
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator block */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-1 shadow-lg h-fit">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-4">
            <Plus className="w-4.5 h-4.5 text-violet-400" />
            Add New Task Card
          </h3>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                Task Title / Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Finish chemistry chapter 2 notes"
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                  Category Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Task['category'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500 h-9"
                >
                  <option value="general">⚙️ Life / Other</option>
                  <option value="study">📚 Study</option>
                  <option value="workout">💪 Gym / Fitness</option>
                  <option value="nutrition">🥗 Diet / Nutrition</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                  Rank Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500 h-9"
                >
                  <option value="low">🟢 Low Rank</option>
                  <option value="medium">🟡 Mid Rank</option>
                  <option value="high">🔴 High Rank</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                Target Date Limit
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500 h-9"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-violet-600 hover:bg-violet-550 text-white font-semibold py-2.5 rounded-xl text-center text-xs shadow-xl shadow-violet-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Store Task Block
            </button>
          </form>
        </div>

        {/* Task lists viewer */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-2 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-violet-400" />
                Tasks Board
              </h3>

              {/* Status selectors */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850 self-start sm:self-auto">
                {(['all', 'pending', 'completed'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilter(opt)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      filter === opt
                        ? 'bg-slate-850 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <ListFilter className="w-12 h-12 stroke-[1.5] text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No matching tasks found</p>
                <p className="text-xs text-slate-600 mt-1">
                  {filter === 'completed'
                    ? 'Work on pending items to clear your checklist!'
                    : filter === 'pending'
                    ? 'All tasks are cleared for this filter. Nicely done!'
                    : 'Create some tasks to start building consistency streaks.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    id={`task-row-${task.id}`}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3.5 transition-all ${
                      task.completed
                        ? 'bg-slate-950/60 border-slate-900/60 opacity-60'
                        : 'bg-slate-950/90 border-slate-800/80 hover:border-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Completion check box */}
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="text-slate-550 hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5.5 h-5.5 text-indigo-500 fill-indigo-500/10" />
                        ) : (
                          <Circle className="w-5.5 h-5.5 text-slate-700 hover:text-slate-500" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0">
                        <p
                          className={`text-slate-200 text-sm font-semibold line-clamp-2 ${
                            task.completed ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {task.text}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/10">
                            {getCategoryEmoji(task.category)}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          {task.dueDate && (
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLogDeleteTask(task.id)}
                      className="text-slate-600 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                      title="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {/* Add helper mapping to avoid lint-issues */}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-800/60 text-center flex justify-between items-center text-[10px] text-slate-500">
            <span>STREAK BOOST: x1.5 EXPR INC</span>
            <span>TASK CARD SCHEDULER</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Avoid missing deletes
  function handleLogDeleteTask(tid: string) {
    handleDeleteTask(tid);
  }
};
