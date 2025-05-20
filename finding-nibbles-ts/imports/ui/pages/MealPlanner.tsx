import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {Sidebar} from '../components/layouts/Sidebar';

export const MealPlanner = () => {

  //state for storing user inputted calorie goal
  const [calorieGoal, setCalorieGoal] = useState('');

  //state for storing meal history, e.g. date a meal was consumed (logged), name of the meal and nutritional info
  const [mealHistory, setMealHistory] = useState([
    { date: '13/05/2025', meal: 'Lasagna', calories: 100, protein: 10.5, fat: 10, carbs: 30 },
    { date: '14/05/2025', meal: 'Fish', calories: 200, protein: 11.5, fat: 11, carbs: 35 },
    { date: '15/05/2025', meal: 'Salad', calories: 300, protein: 12.0, fat: 12, carbs: 40 },
    { date: '16/05/2025', meal: 'Chicken Soup', calories: 400, protein: 12.5, fat: 13, carbs: 45 },
  ]);

  //function to prompt user to add a new entry to meal history
  const handleAddMeal = () => {
    const date = prompt('Enter date (dd/mm/yyyy):');
    const meal = prompt('Enter meal name:');
    //if below inputs are empty, set to 0
    const calories = parseFloat(prompt('Enter total calories:') || '0'); 
    const protein = parseFloat(prompt('Enter protein in grams:') || '0');
    const fat = parseFloat(prompt('Enter fat in grams:') || '0');
    const carbs = parseFloat(prompt('Enter carbs in grams:') || '0');

    //validation
    if (date && meal && !isNaN(calories)) {
        //add new entry to end of meal history array
      setMealHistory([
        ...mealHistory,
        { date, meal, calories, protein, fat, carbs },
      ]);
    }
  };

  //function to delete an entry from meal history
  const handleDeleteMeal = (index: number) => {
    const updated = [...mealHistory];
    updated.splice(index, 1);
    setMealHistory(updated);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center p-6 w-full">
        {/* calorie goal input */}
        <h2 className="text-[28px] font-bold mb-4">Enter your Diet Goals</h2>
        <div className="flex gap-4 mb-6">
          <input
            type="number"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(e.target.value)}
            className="border-2 border-[#b87b45] rounded-xl py-2 px-4 text-center w-40"
            placeholder="Calorie Goal"
          />
          <button className="bg-[#b87b45] text-white px-6 py-2 rounded-xl font-semibold">Apply</button>
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
                  <td>{meal.calories}</td>
                  <td>{meal.protein}g</td>
                  <td>{meal.fat}g</td>
                  <td>{meal.carbs}g</td>
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
            <LineChart data={mealHistory.map(entry => ({ name: entry.date, calories: entry.calories }))}> 
                {/* grey grid lines to enhance readability */}
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              {/* tooltip to show exact date/calorie values on hover */}
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#b87b45" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
