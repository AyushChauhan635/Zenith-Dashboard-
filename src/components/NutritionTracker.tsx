import React, { useState } from 'react';
import { FoodItem, WaterLog, DailyGoal } from '../types';
import { CircularRingProgress } from './PremiumCharts';
import {
  Apple,
  Plus,
  Trash2,
  Droplet,
  History,
  TrendingUp,
  Flame,
  Search,
  GlassWater,
} from 'lucide-react';

interface NutritionTrackerProps {
  foodLogs: FoodItem[];
  setFoodLogs: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  waterLogs: WaterLog[];
  setWaterLogs: React.Dispatch<React.SetStateAction<WaterLog[]>>;
  dailyGoal: DailyGoal;
  setDailyGoal: React.Dispatch<React.SetStateAction<DailyGoal>>;
}

export const NutritionTracker: React.FC<NutritionTrackerProps> = ({
  foodLogs,
  setFoodLogs,
  waterLogs,
  setWaterLogs,
  dailyGoal,
  setDailyGoal,
}) => {
  // Food Logger Input
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number>(350);
  const [protein, setProtein] = useState<number>(20);
  const [carbs, setCarbs] = useState<number>(35);
  const [fat, setFat] = useState<number>(8);
  const [mealType, setMealType] = useState<FoodItem['mealType']>('breakfast');

  const todayStr = new Date().toISOString().substring(0, 10);

  // Quick preset foods
  const quickFoods = [
    { name: '🥚 Boiled Eggs (x2)', calories: 155, protein: 13, carbs: 1, fat: 11, mealType: 'breakfast' as const },
    { name: '🥣 Protein Oatmeal', calories: 340, protein: 22, carbs: 48, fat: 5, mealType: 'breakfast' as const },
    { name: '🍗 Grilled Chicken & Rice', calories: 510, protein: 42, carbs: 62, fat: 9, mealType: 'lunch' as const },
    { name: '🐟 Salmon & Broccoli', calories: 420, protein: 35, carbs: 12, fat: 24, mealType: 'dinner' as const },
    { name: '🥛 Whey Protein Shake', calories: 180, protein: 25, carbs: 3, fat: 2, mealType: 'snack' as const },
    { name: '🍎 Apple & Peanut Butter', calories: 230, protein: 7, carbs: 24, fat: 14, mealType: 'snack' as const },
  ];

  // Calculate totals for TODAY
  const todaysFood = foodLogs.filter((f) => f.date === todayStr);
  const totalCaloriesLogged = todaysFood.reduce((acc, f) => acc + f.calories, 0);
  const totalProteinLogged = todaysFood.reduce((acc, f) => acc + f.protein, 0);
  const totalCarbsLogged = todaysFood.reduce((acc, f) => acc + f.carbs, 0);
  const totalFatLogged = todaysFood.reduce((acc, f) => acc + f.fat, 0);

  // Calculate todays water total
  const todaysWater = waterLogs.filter((w) => w.date === todayStr);
  const totalWaterLoggedMl = todaysWater.reduce((acc, w) => acc + w.amountMl, 0);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: foodName.trim(),
      calories: Math.max(0, Number(calories) || 0),
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fat: Math.max(0, Number(fat) || 0),
      mealType,
      date: todayStr,
    };

    setFoodLogs((prev) => [newItem, ...prev]);
    setFoodName('');
    setCalories(350);
    setProtein(20);
    setCarbs(35);
    setFat(8);
  };

  const handleQuickAddFood = (q: typeof quickFoods[0]) => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: q.name,
      calories: q.calories,
      protein: q.protein,
      carbs: q.carbs,
      fat: q.fat,
      mealType: q.mealType,
      date: todayStr,
    };
    setFoodLogs((prev) => [newItem, ...prev]);
  };

  const handleDeleteFood = (id: string) => {
    setFoodLogs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddWater = (amountMl: number) => {
    const newLog: WaterLog = {
      id: crypto.randomUUID(),
      amountMl,
      date: todayStr,
    };
    setWaterLogs((prev) => [newLog, ...prev]);
  };

  const handleResetWater = () => {
    setWaterLogs((prev) => prev.filter((w) => w.date !== todayStr));
  };

  // Water visual fill percentage
  const waterFillPercent = Math.min((totalWaterLoggedMl / dailyGoal.waterMl) * 100, 100);

  return (
    <div className="space-y-6" id="nutrition-panel">
      {/* Top dashboard charts grid */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Apple className="text-amber-400 w-5.5 h-5.5 shrink-0" />
            Today's Macronutrients Breakdown
          </h3>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400">Target:</span>
            <input
              type="number"
              value={dailyGoal.calories}
              onChange={(e) => setDailyGoal({ ...dailyGoal, calories: Math.max(500, parseInt(e.target.value) || 2000) })}
              className="w-18 bg-slate-950 border border-slate-800 text-center font-mono font-bold text-white rounded px-1 text-xs"
              title="Change everyday calories goal"
            />
            <span className="text-xs text-slate-500 font-mono">kcal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
          {/* Calorie Ring */}
          <div className="flex flex-col items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850">
            <CircularRingProgress
              value={totalCaloriesLogged}
              max={dailyGoal.calories}
              colorTheme="amber"
              label={`${totalCaloriesLogged}`}
              sublabel="CALORIES"
            />
            <span className="text-xs text-slate-400 font-medium font-mono mt-3">
              Goal: {dailyGoal.calories} kcal
            </span>
          </div>

          {/* Protein Ring */}
          <div className="flex flex-col items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850">
            <CircularRingProgress
              value={totalProteinLogged}
              max={dailyGoal.protein}
              colorTheme="emerald"
              label={`${totalProteinLogged}g`}
              sublabel="PROTEIN"
            />
            <span className="text-xs text-slate-400 font-medium font-mono mt-3">
              Goal: {dailyGoal.protein}g
            </span>
          </div>

          {/* Carbs Ring */}
          <div className="flex flex-col items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850">
            <CircularRingProgress
              value={totalCarbsLogged}
              max={dailyGoal.carbs}
              colorTheme="indigo"
              label={`${totalCarbsLogged}g`}
              sublabel="CARBS"
            />
            <span className="text-xs text-slate-400 font-medium font-mono mt-3">
              Goal: {dailyGoal.carbs}g
            </span>
          </div>

          {/* Fats Ring */}
          <div className="flex flex-col items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850">
            <CircularRingProgress
              value={totalFatLogged}
              max={dailyGoal.fat}
              colorTheme="violet"
              label={`${totalFatLogged}g`}
              sublabel="FAT"
            />
            <span className="text-xs text-slate-400 font-medium font-mono mt-3">
              Goal: {dailyGoal.fat}g
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick presets & Custom Adding form */}
        <div className="space-y-6 lg:col-span-1">
          {/* Custom adding form */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-amber-400" />
              Log Custom Food Entry
            </h3>

            <form onSubmit={handleAddFood} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Food/Drink Name
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Avocado Toast with Egg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Meal Category
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as FoodItem['mealType'])}
                    className="w-full h-8.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="breakfast">🍳 Breakfast</option>
                    <option value="lunch">🍱 Lunch</option>
                    <option value="dinner">🥗 Dinner</option>
                    <option value="snack">🥛 Snack</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Energy Goal (kcal)
                  </label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Macros custom list inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-450 transition-colors text-slate-950 text-xs font-bold py-2 rounded-xl mt-1.5 cursor-pointer shadow-lg"
              >
                Log Meal Entry
              </button>
            </form>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3">Quick Food Shortcuts</h3>
            <div className="grid grid-cols-1 gap-2">
              {quickFoods.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAddFood(q)}
                  className="w-full p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-900 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                      {q.name}
                    </span>
                    <span className="text-[9px] block text-slate-500 font-mono">
                      P: {q.protein}g | C: {q.carbs}g | F: {q.fat}g
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                    +{q.calories} kcal
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Diet Logs & Water Tracker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Water Hydration Panel */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Liquid tank rendering with SVG */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
              <span className="text-xs uppercase font-bold tracking-widest font-mono text-cyan-400 mb-4">
                Hydration Cup
              </span>

              {/* Thermos flask container */}
              <div className="relative w-28 h-44 border-4 border-slate-700 rounded-b-2xl rounded-t-lg bg-slate-950/60 overflow-hidden shadow-2xl flex flex-col justify-end">
                {/* Measuring ticks */}
                <div className="absolute inset-0 p-2 flex flex-col justify-between font-mono text-[7px] text-slate-600 pointer-events-none">
                  <span>100% ({dailyGoal.waterMl}ml)</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Animated liquid */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600/90 to-cyan-400/80 transition-all duration-700 relative"
                  style={{ height: `${waterFillPercent}%` }}
                >
                  {/* Subtle bubbles wave */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-300 animate-pulse opacity-40" />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {totalWaterLoggedMl}
                  </span>
                  <span className="text-[8px] tracking-wider uppercase font-extrabold text-slate-300 drop-shadow-md">
                    ml logged
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wide">
                Daily Goal: {dailyGoal.waterMl} ml
              </span>
            </div>

            {/* Log control panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                  <GlassWater className="w-5.5 h-5.5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Log Hydration Water
                  </h4>
                  <p className="text-[10px] text-slate-500 italic">
                    Tap direct glasses to track water intake easily.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleAddWater(250)}
                  className="p-3 bg-slate-950 hover:bg-slate-850/80 rounded-xl border border-slate-850 text-slate-200 text-xs font-semibold cursor-pointer transition-all flex items-center justify-between"
                >
                  <span>🥛 Glass</span>
                  <span className="font-mono text-cyan-400 font-bold">+250ml</span>
                </button>

                <button
                  onClick={() => handleAddWater(500)}
                  className="p-3 bg-slate-950 hover:bg-slate-850/80 rounded-xl border border-slate-850 text-slate-200 text-xs font-semibold cursor-pointer transition-all flex items-center justify-between"
                >
                  <span>🥤 Bottle</span>
                  <span className="font-mono text-cyan-400 font-bold">+500ml</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddWater(100)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 hover:border-slate-750 text-slate-300 justify-center text-[10px] font-bold uppercase rounded-lg border border-slate-850"
                >
                  +100 ml
                </button>
                <button
                  onClick={handleResetWater}
                  className="px-3 py-2 bg-slate-900 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 text-[10px] font-bold uppercase rounded-lg border border-slate-850 transition-colors"
                >
                  Clear Today's Water
                </button>
              </div>
            </div>

          </div>

          {/* Todays Log List */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-slate-850 pb-2">
              <History className="w-4.5 h-4.5 text-amber-400" />
              Logged Food History (Today Only)
            </h3>

            {todaysFood.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                No food logged today yet. Log entries above or tap quick custom shortcuts.
              </p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {todaysFood.map((food) => (
                  <div
                    key={food.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-xs group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{food.name}</span>
                        <span className="text-[8px] font-bold text-amber-400 px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/10 rounded uppercase">
                          {food.mealType}
                        </span>
                      </div>
                      <span className="text-[9px] block text-slate-500 font-mono mt-0.5">
                        P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-slate-200">
                        {food.calories} kcal
                      </span>
                      <button
                        onClick={() => handleDeleteFood(food.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
