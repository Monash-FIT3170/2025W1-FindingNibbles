import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button} from '@mui/material';
import {Sidebar} from '../components/layouts/Sidebar';


export const MealPlanner = () => {
  const dialogContentRef = React.useRef<HTMLDivElement>(null);

  //state for storing user inputted calorie goal
  const [calorieGoal, setCalorieGoal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  //defining the type for meal history entries
  type Meal = {
    date: string;
    meal: string;
    calories: number | null;
    protein: number | null;
    fat: number | null;
    carbs: number | null;
  };

  //state for storing meal history, e.g. date a meal was consumed (logged), name of the meal and nutritional info
  const [mealHistory, setMealHistory] = useState<Meal[]>([
    { date: '13/05/2025', meal: 'Lasagna', calories: 100, protein: 10.5, fat: 10, carbs: 30 },
    { date: '14/05/2025', meal: 'Fish', calories: 200, protein: 11.5, fat: 11, carbs: 35 },
    { date: '15/05/2025', meal: 'Salad', calories: 300, protein: 12.0, fat: 12, carbs: 40 },
    { date: '16/05/2025', meal: 'Chicken Soup', calories: 400, protein: 12.5, fat: 13, carbs: 45 },
  ]);

  //state for opening/closing add meal modal
  const [isDialogOpen, setDialogOpen] = useState(false);
  //to store user input added meal
  const [mealData, setMealData] = useState({
    date: '',
    meal: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: ''
  });

  //opens modal
  const handleAddMeal = () => {
    setDialogOpen(true);
  };

  //function to update specific fields in mealdata object
  const handleChange = (field: string, value: string) => {
    setMealData(prev => ({ ...prev, [field]: value }));
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

    setMealHistory([...mealHistory, newMeal]);
    setDialogOpen(false);
    setMealData({ date: '', meal: '', calories: '', protein: '', fat: '', carbs: '' });
    setErrorMessage('');
  };

  //function to delete an entry from meal history
  const handleDeleteMeal = (index: number) => {
    const updated = [...mealHistory];
    updated.splice(index, 1);
    setMealHistory(updated);
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center p-6 w-full">
        {/* calorie goal input */}
        <h2 className="text-[28px] font-bold mb-4">Enter your daily Calorie Goals</h2>
        <div className="flex gap-4 mb-6">
          <input
            type="number"
            value={calorieGoal}
            onChange={e => setCalorieGoal(e.target.value)}
            className="border-2 border-[#b87b45] rounded-xl py-2 px-4 text-center w-40"
            placeholder="Calorie Goal"
          />
        </div>

        <h2 className="text-[24px] font-bold mb-4">Your Progress</h2>

        {/* meal history table */}
        <div className="overflow-x-auto w-full max-w-4xl mb-6">
          <table className="w-full border border-[#b87b45] text-sm md:text-base">
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
              {mealHistory.map((meal, index) => (
                <tr key={index} className="text-center border-b">
                  <td className="p-2">{meal.date}</td>
                  <td>{meal.meal}</td>
                  <td>{meal.calories != null ? meal.calories : 'N/A'}</td>
                  <td>{meal.protein != null ? meal.protein : 'N/A'}</td>
                  <td>{meal.fat != null ? meal.fat : 'N/A'}</td>
                  <td>{meal.carbs != null ? meal.carbs : 'N/A'}</td>
                  <td>
                    <button onClick={() => handleDeleteMeal(index)} className="text-red-500 font-bold">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAddMeal} className="mt-3 bg-[#b87b45] text-white px-4 py-2 rounded-lg font-semibold">Add More</button>
        </div>

        {/* Graph */}
        <div className="w-full max-w-2xl h-64">
          <h3 className="text-lg font-semibold mb-2">Total calories over time</h3>
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
      </div>

      {/* Modal for adding meals */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        slotProps={{
          paper: {
            className: "w-[400px] h-[400px] rounded-xl",
          },
        }}
      >
        {/* <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}> */}
        <DialogTitle>Add a Meal</DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmAddMeal} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
