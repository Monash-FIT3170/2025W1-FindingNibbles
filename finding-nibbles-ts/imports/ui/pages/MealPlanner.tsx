import React, { useState, useEffect } from 'react';
import { Meals } from '../api/meals';
import type { MealType } from '../api/meals';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button} from '@mui/material';
import type { CustomUser } from '../types/User';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import DescriptionIcon from '@mui/icons-material/Description';


export const MealPlanner = () => {
  const dialogContentRef = React.useRef<HTMLDivElement>(null);

  //state for storing user inputted calorie/macro goals
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [carbGoal, setCarbGoal] = useState('');
  const [fatGoal, setFatGoal] = useState('');
  const [calorieError, setCalorieError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // State for goal dialog modal
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  Meteor.subscribe('userData');

  //get current user
  const user = useTracker(() => Meteor.user() as CustomUser | null);



  //track if calorieGoal is already initialised
  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current && user) {
      if (user.profile?.calorieGoal != null) {
        setCalorieGoal(String(user.profile.calorieGoal));
      }
      if (user.profile?.macroGoals) {
        setProteinGoal(String(user.profile.macroGoals.protein));
        setCarbGoal(String(user.profile.macroGoals.carbs));
        setFatGoal(String(user.profile.macroGoals.fat));
      }
      initialized.current = true;
    }
  }, [user]);
  // Save macro goals to backend
  const saveMacroGoals = () => {
    const protein = Number(proteinGoal);
    const carbs = Number(carbGoal);
    const fat = Number(fatGoal);

    if ([protein, carbs, fat].some(n => isNaN(n) || n < 0)) {
      setCalorieError('Macro goals must be valid non-negative numbers');
      return;
    }

    Meteor.call('users.updateMacroGoals', { protein, carbs, fat }, (error: Meteor.Error | null) => {
      if (error) {
        setCalorieError(error.message);
      } else {
        setCalorieError('');
      }
    });
  };

  // Save calorie goal to backend 
  const saveCalorieGoal = () => {
    const goalNumber = Number(calorieGoal);

    if (isNaN(goalNumber) || goalNumber < 0) {
      setCalorieError('Please enter a valid positive calorie goal');
      return;
    }

    if (!user) {
      setCalorieError('You must be logged in to save a calorie goal');
      return;
    }

    Meteor.call('users.updateCalorieGoal', goalNumber, (error: Meteor.Error | null) => {
      if (error) {
        setCalorieError(error.message);
      } else {
        setCalorieError('');
      }
    });
  };

  Meteor.subscribe('meals');
  const mealHistory: MealType[] = useTracker(() => Meals.find({}, { sort: { date: 1 } }).fetch(), []);

  //state for opening/closing view meal history modal
  const [mealTableOpen, setMealTableOpen] = useState(false);

  //state for opening/closing add meal modal
  const [isDialogOpen, setDialogOpen] = useState(false);

  //to store user input added meal
  const [mealData, setMealData] = useState({
    date: '',
    meal: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  });

  //opens modal
  const handleAddMeal = () => {
    setDialogOpen(true);
  };

  //function to update specific fields in mealdata object
  const handleChange = (field: string, value: string) => {
    setMealData((prev) => ({ ...prev, [field]: value }));
  };

  //to parse/save meal data into mealHistory state
  const handleConfirmAddMeal = () => {
    const { date, meal, calories, protein, fat, carbs } = mealData;
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    //validation
    if (!date || !meal) {
      setErrorMessage('Fields with asterisk are mandatory.');
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }

    //max 100 char meal name limit
    if (meal.length > 100) {
      setErrorMessage("Error: meal name is too long.")
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }

    // max 10000 kcal calorie limit
    if (Number(calories) > 10000){
      setErrorMessage("Error: unreasonable calorie amount.")
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }

    // max 10000g protein/carb/fat limit
    if (Number(protein) > 10000 || Number(carbs) > 10000 || Number(fat) > 10000){
      setErrorMessage("Error: unreasonable macro nutrient amount.")
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }

    if (!dateRegex.test(date)) {
      setErrorMessage("Error: expected date format is 'dd/mm/yyyy'.");
      dialogContentRef.current?.scrollTo({ top: 0 });
      return;
    }

    const numericFields = ['calories', 'protein', 'fat', 'carbs'] as const;
    for (let field of numericFields) {
      const value = mealData[field];
      if (value !== '' && parseFloat(value) < 0) {
        setErrorMessage('Calories, protein, fat, and carbs must be non-negative.');
        dialogContentRef.current?.scrollTo({ top: 0 });
        return;
      }
    }

    const newMeal = {
      date,
      meal,
      calories: calories !== '' ? parseFloat(calories) : null,
      protein: protein !== '' ? parseFloat(protein) : null,
      fat: fat !== '' ? parseFloat(fat) : null,
      carbs: carbs !== '' ? parseFloat(carbs) : null,
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

  //function to delete an entry from meal history
  const handleDeleteMeal = (mealId: string) => {
    Meteor.call('meals.remove', mealId, (error: Meteor.Error | null) => {
      if (error) {
        console.error(error.message);
      }
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

  // Function to aggregate macro data by date
  const getMacroChartData = () => {
    const macroMap = new Map<string, { protein: number, carbs: number, fat: number }>();
  
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
            <h1 className="text-3xl font-bold text-[#4b2e19] mb-4">Meal Manager</h1>
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
                <button onClick={() => setGoalDialogOpen(true)} className="flex-1 min-w-[30%] bg-[#b87b45] text-white px-6 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition hover:cursor-pointer"><TuneIcon />Set Goals</button>
                <button onClick={() => setMealTableOpen(true)} className="flex-1 min-w-[30%] bg-[#b87b45] text-white px-6 py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition hover:cursor-pointer"><DescriptionIcon />View Meal History</button>
              </div>
            </div>
          </div>

          {/* Meal History Modal */}
          <Dialog
            open={mealTableOpen}
            onClose={() => setMealTableOpen(false)}
            maxWidth="lg"
            fullWidth>
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
            <DialogActions sx={{justifyContent: 'space-between',}} className="flex justify-between px-6 pb-4">
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
                {/* creates a line chart with the date, calories dummy data (from meal history var) */}
                <LineChart data={getAggregatedAndSortedChartData()}>
                  {/* grey grid lines to enhance readability */}
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  {/* tooltip to show exact date/calorie values on hover */}
                  <Tooltip />
                  {/* Calorie goal line */}
                  {calorieGoal && !isNaN(Number(calorieGoal)) && (
                    <ReferenceLine
                      y={Number(calorieGoal)}
                      label="Goal"
                      stroke="#e57373"
                      strokeDasharray="3 3"
                      ifOverflow="extendDomain"
                    />
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
                  {proteinGoal && !isNaN(Number(proteinGoal)) && (
                    <ReferenceLine
                      y={Number(proteinGoal)}
                      label="Goal"
                      stroke="#6b7280"
                      strokeDasharray="3 3"
                      ifOverflow="extendDomain"/>
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
                  {carbGoal && !isNaN(Number(carbGoal)) && (
                    <ReferenceLine
                      y={Number(carbGoal)}
                      label="Goal"
                      stroke="#6b7280"
                      strokeDasharray="3 3"
                      ifOverflow="extendDomain"/>
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
                  {fatGoal && !isNaN(Number(fatGoal)) && (
                    <ReferenceLine
                      y={Number(fatGoal)}
                      label="Goal"
                      stroke="#6b7280"
                      strokeDasharray="3 3"
                      ifOverflow="extendDomain"/>
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
          slotProps={{
            paper: {
              className: 'w-[90vw] max-w-md rounded-xl',
            },
          }}
        >
          <DialogTitle>Add a Meal</DialogTitle>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogContent ref={dialogContentRef} className="flex flex-col gap-3 py-2">
            {errorMessage && (
              <div className="text-red-600 text-sm font-medium mb-2">{errorMessage}</div>
            )}
            <TextField label="Date (dd/mm/yyyy) *" value={mealData.date} onChange={e => handleChange('date', e.target.value)} fullWidth />
            <TextField label="Meal Name *" value={mealData.meal} onChange={e => handleChange('meal', e.target.value)} fullWidth />
            <TextField label="Calories" type="number" value={mealData.calories} onChange={e => handleChange('calories', e.target.value)} fullWidth inputProps={{ onWheel: (e) => e.currentTarget.blur() }} />
            <TextField label="Protein (g)" type="number" value={mealData.protein} onChange={e => handleChange('protein', e.target.value)} fullWidth inputProps={{ onWheel: (e) => e.currentTarget.blur() }} />
            <TextField label="Fat (g)" type="number" value={mealData.fat} onChange={e => handleChange('fat', e.target.value)} fullWidth inputProps={{ onWheel: (e) => e.currentTarget.blur() }} />
            <TextField label="Carbs (g)" type="number" value={mealData.carbs} onChange={e => handleChange('carbs', e.target.value)} fullWidth inputProps={{ onWheel: (e) => e.currentTarget.blur() }}/>
          </DialogContent>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogActions sx={{justifyContent: 'space-between',}} className="flex justify-between px-6 pb-4">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button onClick={handleConfirmAddMeal} className="bg-[#b87b45] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base hover:cursor-pointer">Add</Button>
          </DialogActions>
        </Dialog>
        {/* Modal for setting goals */}
        <Dialog
          open={goalDialogOpen}
          onClose={() => setGoalDialogOpen(false)}
          slotProps={{
            paper: {
              className: 'w-[90vw] max-w-md rounded-xl',
            },
          }}>
          <DialogTitle className="text-lg font-bold">Set Goals</DialogTitle>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogContent className="flex flex-col gap-3 py-2">
            <TextField label="Target Daily Calories" type="number" value={calorieGoal} onChange={(e) => setCalorieGoal(e.target.value)} fullWidth />
            <TextField label="Protein Goal (g)" type="number" value={proteinGoal} onChange={(e) => setProteinGoal(e.target.value)} fullWidth />
            <TextField label="Carbs Goal (g)" type="number" value={carbGoal} onChange={(e) => setCarbGoal(e.target.value)} fullWidth />
            <TextField label="Fat Goal (g)" type="number" value={fatGoal} onChange={(e) => setFatGoal(e.target.value)} fullWidth />
            {calorieError && (
              <div className="text-red-600 text-sm font-medium">{calorieError}</div>
            )}
          </DialogContent>
          <hr className="border-t border-[#e2cfc3] w-full" />
          <DialogActions sx={{justifyContent: 'space-between',}} className="flex justify-between px-6 pb-4">
            <Button onClick={() => setGoalDialogOpen(false)}>Close</Button>
            <Button onClick={() => {saveCalorieGoal(); saveMacroGoals(); setGoalDialogOpen(false);}} className="bg-[#b87b45] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base hover:cursor-pointer">Save</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};