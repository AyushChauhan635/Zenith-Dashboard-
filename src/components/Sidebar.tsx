import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  Apple,
  BellRing,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  appName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  appName = 'Zenith Sync',
}) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-400' },
    { id: 'studies', label: 'Study Hub', icon: BookOpen, color: 'text-sky-400' },
    { id: 'workouts', label: 'Workout Deck', icon: Dumbbell, color: 'text-emerald-400' },
    { id: 'nutrition', label: 'Nutrition & Macros', icon: Apple, color: 'text-amber-400' },
    { id: 'alarms', label: 'Alarms & Audios', icon: BellRing, color: 'text-rose-400' },
    { id: 'todos', label: 'Task List', icon: CheckSquare, color: 'text-violet-400' },
  ];

  return (
    <aside
      id="sidebar-container"
      className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-auto md:h-screen shrink-0"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-none uppercase">
            {appName}
          </h1>
          <span className="text-[10px] text-indigo-400 font-mono tracking-widest block mt-0.5">
            PERSONAL OS
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 relative cursor-pointer ${
                isActive
                  ? 'bg-slate-800/80 text-white shadow-inner shadow-slate-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
              <span>{item.label}</span>

              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Account Info / Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 font-mono shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYS ONLINE</span>
        </div>
        <span>v1.2.5</span>
      </div>
    </aside>
  );
};
