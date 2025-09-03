import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

const originalDishes = [
  { name: "Margherita Pizza", image: "/images/Margherita_pizza.png", cuisine: "Italian" },
  { name: "Sushi", image: "/images/sushi.png", cuisine: "Japanese" },
  { name: "Tacos", image: "/images/tacos.png", cuisine: "Mexican" },
  { name: "Butter Chicken", image: "/images/butter_chicken.png", cuisine: "Indian" },
  { name: "Pad Thai", image: "/images/pad_thai.png", cuisine: "Thai" },
  { name: "Falafel", image: "/images/falafel.png", cuisine: "Middle Eastern" },
  { name: "Peking Duck", image: "/images/peking_duck.png", cuisine: "Chinese" },
  { name: "Croissant", image: "/images/Croissant.png", cuisine: "French" },
  { name: "Kimchi Jjigae", image: "/images/kimchi_jjigae.png", cuisine: "Korean" },
  { name: "Paella", image: "/images/Paella.png", cuisine: "Spanish" },
  { name: "Moussaka", image: "/images/Moussaka.png", cuisine: "Greek" },
  { name: "Jollof Rice", image: "/images/Jollof_rice.png", cuisine: "West African" },
  { name: "Pierogi", image: "/images/Pierogi.png", cuisine: "Polish" },
  { name: "Ceviche", image: "/images/Ceviche.png", cuisine: "Peruvian" },
  { name: "Tom Yum Soup", image: "/images/Tom_yum_soup.png", cuisine: "Thai" },
  { name: "Goulash", image: "/images/Goulash.png", cuisine: "Hungarian" },
  { name: "Chicken Shawarma", image: "/images/chicken_shawarma.png", cuisine: "Middle Eastern" },
  { name: "Fish and Chips", image: "/images/Fish_and_chips.png", cuisine: "British" },
  { name: "Empanadas", image: "/images/Empanadas.png", cuisine: "Argentinian" },
  { name: "Pho", image: "/images/Pho.png", cuisine: "Vietnamese" },
];

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


const SwipeDishesPopup = ({ onClose }) => {
  const [dishes, setDishes] = useState(originalDishes);
  const [index, setIndex] = useState(0);

  // Shuffle dishes on mount
  React.useEffect(() => {
    setDishes(shuffleArray(originalDishes));
  }, []);

  const handleSwipe = (liked) => {
    const dish = dishes[index];
    Meteor.call("dishes.swipe", { name: dish.name, liked });
    if (index < dishes.length - 1) setIndex(index + 1);
    else onClose();
  };

  if (index >= dishes.length) return null;

  const dish = dishes[index];

  return (
  <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center w-[350px] max-w-full relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <img src={dish.image} alt={dish.name} className="w-64 h-48 object-cover rounded-xl mb-4 border border-gray-200 shadow" />
        <h2 className="text-2xl font-bold mb-2 text-center">{dish.name}</h2>
        <p className="text-lg text-gray-600 mb-6 text-center">{dish.cuisine}</p>
        <div className="flex gap-6 mb-2">
          <button
            onClick={() => handleSwipe(false)}
            className="bg-red-100 hover:bg-red-200 text-red-600 text-2xl rounded-full w-16 h-16 flex items-center justify-center shadow transition"
            aria-label="Dislike"
          >
            👎
          </button>
          <button
            onClick={() => handleSwipe(true)}
            className="bg-green-100 hover:bg-green-200 text-green-600 text-2xl rounded-full w-16 h-16 flex items-center justify-center shadow transition"
            aria-label="Like"
          >
            👍
          </button>
        </div>
        <span className="text-sm text-gray-400">{index + 1} / {dishes.length}</span>
      </div>
    </div>
  );
};

export default SwipeDishesPopup;