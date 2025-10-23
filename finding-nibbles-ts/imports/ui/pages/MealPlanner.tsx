import React, { useState, useEffect } from 'react';
import { Meals } from '../../api/meals';
import type { MealType } from '../../api/meals';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import type { CustomUser } from '../types/User';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import DescriptionIcon from '@mui/icons-material/Description';

export const MealPlanner = () => {
  const dialogContentRef = React.useRef<HTMLDivElement>(null);

  // live values (used by charts)
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [carbGoal, setCarbGoal] = useState('');
  const [fatGoal, setFatGoal] = useState('');

  // draft values (used only inside the dialog until save succeeds)
  const [calorieGoalDraft, setCalorieGoalDraft] = useState('');
  const [proteinGoalDraft, setProteinGoalDraft] = useState('');
  const [carbGoalDraft, setCarbGoalDraft] = useState('');
  const [fatGoalDraft, setFatGoalDraft] = useState('');

  const [calorieError, setCalorieError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  // Reasonable daily upper bounds
  const LIMITS = {
    calories: { min: 0, max: 10000 },
    protein:  { min: 0, max: 1000 },
    carbs:    { min: 0, max: 1000 },
    fat:      { min: 0, max: 1000 },
  };

  function isNumberInRange(n: number, { min, max }: { min: number; max: number }) {
    return Number.isFinite(n) && n >= min && n <= max;
  }
  const clamp = (n: number, lim: {min:number;max:number}) => Math.max(lim.min, Math.min(lim.max, n));
  const onlyDigits = (s: string) => s.replace(/[^\d]/g, ''); // strip anything not 0-9

  // Parse dd/mm/yyyy -> Date or null
  function parseDdMmYyyy(s: string): Date | null {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
    if (!m) return null;
    const [_, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return (d.getFullYear() === Number(yyyy) && d.getMonth() === Number(mm) - 1 && d.getDate() === Number(dd))
      ? d
      : null;
  }
  // must be within the past 6 months (inclusive) and not in the future
  function isWithinPastSixMonths(dateStr: string): boolean {
    const d = parseDdMmYyyy(dateStr);
    if (!d) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    return d >= sixMonthsAgo && d <= today;
  }

  Meteor.subscribe('userData');
  const user = useTracker(() => Meteor.user() as CustomUser | null);

  const initialized = React.useRef(false);
  useEffect(() => {
    if (!initialized.current && user) {
      if (user.profile?.calorieGoal != null) {
        const v = String(user.profile.calorieGoal);
        setCalorieGoal(v);
        setCalorieGoalDraft(v);
      }
      if (user.profile?.macroGoals) {
        const p = String(user.profile.macroGoals.protein);
        const c = String(user.profile.macroGoals.carbs);
        const f = String(user.profile.macroGoals.fat);
        setProteinGoal(p); setProteinGoalDraft(p);
        setCarbGoal(c);    setCarbGoalDraft(c);
        setFatGoal(f);     setFatGoalDraft(f);
      }
      initialized.current = true;
    }
  }, [user]);

  // Open goals dialog: sync drafts from live
  const openGoalsDialog = () => {
    setCalorieGoalDraft(calorieGoal);
    setProteinGoalDraft(proteinGoal);
    setCarbGoalDraft(carbGoal);
    setFatGoalDraft(fatGoal);
    setCalorieError('');
    setGoalDialogOpen(true);
  };

  // Save handler: validate -> server -> update live -> close
  const handleSaveGoals = () => {
    const cal = Number(calorieGoalDraft);
    const p = Number(proteinGoalDraft);
    const c = Number(carbGoalDraft);
    const f = Number(fatGoalDraft);

    if ([cal, p, c, f].some((n) => !Number.isFinite(n))) {
      setCalorieError('All goals must be valid numbers.');
      return; // keep dialog open
    }
    if (!isNumberInRange(cal, LIMITS.calories) ||
        !isNumberInRange(p, LIMITS.protein)   ||
        !isNumberInRange(c, LIMITS.carbs)     ||
        !isNumberInRange(f, LIMITS.fat)) {
      setCalorieError(
        `Calories ${LIMITS.calories.min}-${LIMITS.calories.max}. ` +
        `Protein ${LIMITS.protein.min}-${LIMITS.protein.max}g, ` +
        `Carbs ${LIMITS.carbs.min}-${LIMITS.carbs.max}g, ` +
        `Fat ${LIMITS.fat.min}-${LIMITS.fat.max}g.`
      );
      return; // keep dialog open
    }
    if (!user) {
      setCalorieError('You must be logged in to save goals.');
      return;
    }

    Meteor.call('users.updateCalorieGoal', cal, (err1: Meteor.Error | null) => {
      if (err1) { setCalorieError(err1.message); return; }
      Meteor.call('users.updateMacroGoals', { protein: p, carbs: c, fat: f }, (err2: Meteor.Error | null) => {
        if (err2) { setCalorieError(err2.message); return; }
        // Success -> sync live (charts read these), close dialog
        setCalorieGoal(String(cal));
        setProteinGoal(String(p));
        setCarbGoal(String(c));
        setFatGoal(String(f));
        setCalorieError('');
        setGoalDialogOpen(false);
      });
    });
  };

  // Sanitized onChange helpers (digits only + clamp, allow empty string)
  const onChangeDigitsClamped = (
    raw: string,
    lim: {min:number;max:number},
    setter: (v: string) => void
  ) => {
    const stripped = onlyDigits(raw);
    if (stripped === '') { setter(''); return; }   // allow clearing
    const n = Number(stripped);
    setter(String(clamp(n, lim)));
  };

  Meteor.subscribe('meals');
  const mealHistory: MealType[] = useTracker(() => Meals.find({}, { sort: { date: 1 } }).fetch(), []);

  const [mealTableOpen, setMealTableOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [mealData, setMealData] = useState({
    date: '',
    meal: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  });

  const handleAddMeal = () => setDialogOpen(true);
  const handleChange = (field: string, value: string) => {
    setMealData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmAddMeal = () => {
    const { date, meal, calories, protein, fat, carbs } = mealData;
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

    if (!date || !meal) {
      setErrorMessage('Fields with asterisk are mandatory.');
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }
    if (!dateRegex.test(date) || !isWithinPastSixMonths(date)) {
      setErrorMessage("Date must be in 'dd/mm/yyyy' format, not in the future, and within the past 6 months.");
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }
    // safety: letters + spaces only
    if (!/^[A-Za-z\s]+$/.test(meal)) {
      setErrorMessage('Meal name can only contain letters and spaces.');
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }
    if (meal.length > 100) {
      setErrorMessage('Error: meal name is too long.');
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }

    // numeric ranges (same limits as goals); allow empty (treated as null later)
    const toNumOrNull = (v: string) => (v === '' ? null : Number(v));
    const calN = toNumOrNull(calories);
    const proN = toNumOrNull(protein);
    const fatN = toNumOrNull(fat);
    const carbN= toNumOrNull(carbs);

    const invalid =
      (calN != null && !isNumberInRange(calN, LIMITS.calories)) ||
      (proN != null && !isNumberInRange(proN, LIMITS.protein))  ||
      (fatN != null && !isNumberInRange(fatN, LIMITS.fat))      ||
      (carbN!= null && !isNumberInRange(carbN, LIMITS.carbs));

    if (invalid) {
      setErrorMessage(
        `Numbers out of range. Calories ${LIMITS.calories.min}-${LIMITS.calories.max}. ` +
        `Protein ${LIMITS.protein.min}-${LIMITS.protein.max}g, ` +
        `Carbs ${LIMITS.carbs.min}-${LIMITS.carbs.max}g, ` +
        `Fat ${LIMITS.fat.min}-${LIMITS.fat.max}g.`
      );
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }

    const newMeal = {
      date,
      meal,
      calories: calN,
      protein: proN,
      fat: fatN,
      carbs: carbN,
    };

    Meteor.call('meals.insert', newMeal, (error: Meteor.Error | null) => {
      if (error) {
        setErrorMessage(error.message);
        dialogContentRef.current?.scrollTo({ top: 0 });
      } else {
        setDialogOpen(false);
        setMealData({ date: '', meal: '', calories: '', protein: '', fat: '', carbs: '' });
        setErrorMessage('');
      }
    });
  };

  const handleDeleteMeal = (mealId: string) => {
    Meteor.call('meals.remove', mealId, (error: Meteor.Error | null) => {
      if (error) console.error(error.message);
    });
  };

  const getAggregatedAndSortedChartData = () => {
    const calorieMap = new Map<string, number>();
    mealHistory.forEach(({ date, calories }) => {
      if (typeof calories === 'number') {
        calorieMap.set(date, (calorieMap.get(date) || 0) + calories);
      }
    });
    return Array.from(calorieMap.entries())
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a[0].split('/').map(Number);
        const [dayB, monthB, yearB] = b[0].split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      })
      .map(([date, calories]) => ({ name: date, calories }));
  };

  const getMacroChartData = () => {
    const macroMap = new Map<string, { protein: number; carbs: number; fat: number }>();
    mealHistory.forEach(({ date, protein, carbs, fat }) => {
      if (!macroMap.has(date)) {
        macroMap.set(date, { protein: 0, carbs: 0, fat: 0 });
      }
      const entry = macroMap.get(date)!;
      if (typeof protein === 'number') entry.protein += protein;
      if (typeof carbs === 'number') entry.carbs += carbs;
      if (typeof fat === 'number') entry.fat += fat;
    });
    return Array.from(macroMap.entries())
      .sort(([a], [b]) => {
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
      })
      .map(([date, values]) => ({ name: date, ...values }));
  };

  return (
    <div className="flex min-h-screen pt-20">
      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <div className="flex flex-col w-full space-y-6 pb-8">
          {/* Page Title */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-[#4b2e19] mb-4">Meal Planner</h1>
            <p className="text-sm text-[#7a5c43]">Track your meals and set your nutritional goals</p>
          </div>

          {/* Actions Section */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-10">
            <div className="w-full bg-[#fdf7f2] border border-[#b87b45] rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#4b2e19]">Actions</h2>
                <span className="text-sm text-[#7a5c43]">Set your goals. Add your meals. Watch your progress.</span>
              </div>
              <div className="border-t border-[#e2cfc3] my-4"></div>
              <div className="flex flex-wrap gap-4 justify-between items-center mt-4">
                <button onClick={handleAddMeal} className="flex-1 min-w-[30%] bg-[#b87b45] text-white px-6 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition hover:cursor-pointer"><AddIcon />Add Meal</button>
                <button onClick={openGoalsDialog} className="flex-1 min-w-[30%] bg-[#b87b45] text-white px-6 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition hover:cursor-pointer"><TuneIcon />Set Goals</button>
                <button onClick={() => setMealTableOpen(true)} className="flex-1 min-w-[30%] bg-[#b87b45] text-white px-6 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition hover:cursor-pointer"><DescriptionIcon />View Meal History</button>
              </div>
            </div>
          </div>

          {/* Meal History Modal */}
          <Dialog open={mealTableOpen} onClose={() => setMealTableOpen(false)} maxWidth="lg" fullWidth>
            <DialogTitle>Meal History</DialogTitle>
            <DialogContent dividers>
              <div className="overflow-x-auto">
                <table className="w-full border border-[#b87b45] text-sm">
                  <thead className="bg-[#d5a16e] text-white">
                    <tr>
                      <th className="p-2">Date</th>
                      <th>Meal</th>
                      <th>Total Calories</th>
                      <th>Protein</th>
                      <th>Fat</th>
                      <th>Carbs</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealHistory.map((meal) => (
                      <tr key={meal._id} className="text-center border-b">
                        <td className="p-2">{meal.date}</td>
                        <td className="break-all">{meal.meal}</td>
                        <td>{meal.calories != null ? meal.calories : 'N/A'}</td>
                        <td>{meal.protein != null ? meal.protein : 'N/A'}</td>
                        <td>{meal.fat != null ? meal.fat : 'N/A'}</td>
                        <td>{meal.carbs != null ? meal.carbs : 'N/A'}</td>
                        <td>
                          <button onClick={() => handleDeleteMeal(meal._id!)} className="text-red-500 font-bold hover:cursor-pointer">X</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
            <DialogActions sx={{justifyContent: 'space-between'}} className="flex justify-between px-6 pb-4">
              <Button onClick={() => setMealTableOpen(false)}>Close</Button>
              <Button onClick={handleAddMeal} className="bg-[#b87b45] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base hover:cursor-pointer">Add Meals</Button>
            </DialogActions>
          </Dialog>

          {/* Charts Section */}
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-10">
            <hr className="border-t-2 border-[#b87b45] w-full my-6" />
            <h2 className="text-[28px] font-bold mb-4">Charts</h2>

            {/* calorie Graph */}
            <div className="w-full h-64 mb-16">
              <h3 className="text-lg font-semibold text-center mb-4">Daily Caloric Intake Over Time</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getAggregatedAndSortedChartData()}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {/* Calorie goal line (only show if live value is valid) */}
                  {isNumberInRange(Number(calorieGoal), LIMITS.calories) && (
                    <ReferenceLine y={Number(calorieGoal)} label="Goal" stroke="#e57373" strokeDasharray="3 3" ifOverflow="extendDomain" />
                  )}
                  <Line type="monotone" dataKey="calories" stroke="#b87b45" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Protein Chart */}
            <div className="w-full h-64 mb-16">
              <h3 className="text-lg font-semibold text-center mb-4">Protein Intake Over Time</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMacroChartData()}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {isNumberInRange(Number(proteinGoal), LIMITS.protein) && (
                    <ReferenceLine y={Number(proteinGoal)} label="Goal" stroke="#6b7280" strokeDasharray="3 3" ifOverflow="extendDomain" />
                  )}
                  <Line type="monotone" dataKey="protein" stroke="#38bdf8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Carbs Chart */}
            <div className="w-full h-64 mb-16">
              <h3 className="text-lg font-semibold text-center mb-4">Carbohydrates Intake Over Time</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMacroChartData()}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {isNumberInRange(Number(carbGoal), LIMITS.carbs) && (
                    <ReferenceLine y={Number(carbGoal)} label="Goal" stroke="#6b7280" strokeDasharray="3 3" ifOverflow="extendDomain" />
                  )}
                  <Line type="monotone" dataKey="carbs" stroke="#facc15" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Fat Chart */}
            <div className="w-full h-64 mb-16">
              <h3 className="text-lg font-semibold text-center mb-4">Fat Intake Over Time</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMacroChartData()}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {isNumberInRange(Number(fatGoal), LIMITS.fat) && (
                    <ReferenceLine y={Number(fatGoal)} label="Goal" stroke="#6b7280" strokeDasharray="3 3" ifOverflow="extendDomain" />
                  )}
                  <Line type="monotone" dataKey="fat" stroke="#f87171" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Modal for adding meals */}
        <Dialog
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          slotProps={{ paper: { className: 'w-[90vw] max-w-md rounded-xl' } }}
        >
          <DialogTitle>Add a Meal</DialogTitle>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogContent ref={dialogContentRef} className="flex flex-col gap-3 py-2">
            {errorMessage && <div className="text-red-600 text-sm font-medium mb-2">{errorMessage}</div>}
            <TextField label="Date (dd/mm/yyyy) *" value={mealData.date} onChange={e => handleChange('date', e.target.value)} fullWidth />
            <TextField
              label="Meal Name *"
              value={mealData.meal}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, '');
                setMealData((prev) => ({ ...prev, meal: cleaned }));
              }}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab',' '];
                if (!/^[A-Za-z]$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
            />
            <TextField
              label="Calories"
              type="text"
              inputMode="numeric"
              value={mealData.calories}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                if (digits === '') { setMealData(p => ({ ...p, calories: '' })); return; }
                const n = clamp(Number(digits), LIMITS.calories);
                setMealData(p => ({ ...p, calories: String(n) }));
              }}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
            />
            <TextField
              label="Protein (g)"
              type="text"
              inputMode="numeric"
              value={mealData.protein}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                if (digits === '') { setMealData(p => ({ ...p, protein: '' })); return; }
                const n = clamp(Number(digits), LIMITS.protein);
                setMealData(p => ({ ...p, protein: String(n) }));
              }}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
            />
            <TextField
              label="Fat (g)"
              type="text"
              inputMode="numeric"
              value={mealData.fat}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                if (digits === '') { setMealData(p => ({ ...p, fat: '' })); return; }
                const n = clamp(Number(digits), LIMITS.fat);
                setMealData(p => ({ ...p, fat: String(n) }));
              }}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
            />
            <TextField
              label="Carbs (g)"
              type="text"
              inputMode="numeric"
              value={mealData.carbs}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                if (digits === '') { setMealData(p => ({ ...p, carbs: '' })); return; }
                const n = clamp(Number(digits), LIMITS.carbs);
                setMealData(p => ({ ...p, carbs: String(n) }));
              }}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
            />
          </DialogContent>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogActions sx={{ justifyContent: 'space-between' }} className="flex justify-between px-6 pb-4">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button onClick={handleConfirmAddMeal} className="bg-[#b87b45] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base hover:cursor-pointer">Add</Button>
          </DialogActions>
        </Dialog>

        {/* Modal for setting goals */}
        <Dialog
          open={goalDialogOpen}
          onClose={() => setGoalDialogOpen(false)}
          slotProps={{ paper: { className: 'w-[90vw] max-w-md rounded-xl' } }}
        >
          <DialogTitle className="text-lg font-bold">Set Goals</DialogTitle>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogContent className="flex flex-col gap-3 py-2">
            {/* Use type="text" + inputMode to fully block -, e, +, etc. */}
            <TextField
              label="Target Daily Calories"
              type="text"
              inputMode="numeric"
              value={calorieGoalDraft}
              onChange={(e) => onChangeDigitsClamped(e.target.value, LIMITS.calories, setCalorieGoalDraft)}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
              slotProps={{ input: { inputProps: { pattern: '[0-9]*', onWheel: (ev: any) => ev.currentTarget.blur() } } }}
            />
            <TextField
              label="Protein Goal (g)"
              type="text"
              inputMode="numeric"
              value={proteinGoalDraft}
              onChange={(e) => onChangeDigitsClamped(e.target.value, LIMITS.protein, setProteinGoalDraft)}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
              slotProps={{ input: { inputProps: { pattern: '[0-9]*', onWheel: (ev: any) => ev.currentTarget.blur() } } }}
            />
            <TextField
              label="Carbs Goal (g)"
              type="text"
              inputMode="numeric"
              value={carbGoalDraft}
              onChange={(e) => onChangeDigitsClamped(e.target.value, LIMITS.carbs, setCarbGoalDraft)}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
              slotProps={{ input: { inputProps: { pattern: '[0-9]*', onWheel: (ev: any) => ev.currentTarget.blur() } } }}
            />
            <TextField
              label="Fat Goal (g)"
              type="text"
              inputMode="numeric"
              value={fatGoalDraft}
              onChange={(e) => onChangeDigitsClamped(e.target.value, LIMITS.fat, setFatGoalDraft)}
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
                if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
              }}
              fullWidth
              slotProps={{ input: { inputProps: { pattern: '[0-9]*', onWheel: (ev: any) => ev.currentTarget.blur() } } }}
            />

            {calorieError && <div className="text-red-600 text-sm font-medium">{calorieError}</div>}
          </DialogContent>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogActions sx={{ justifyContent: 'space-between' }} className="flex justify-between px-6 pb-4">
            <Button onClick={() => setGoalDialogOpen(false)}>Close</Button>
            <Button onClick={handleSaveGoals} className="bg-[#b87b45] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base hover:cursor-pointer">Save</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};
