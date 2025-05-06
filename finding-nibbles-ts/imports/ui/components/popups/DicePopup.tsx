import React, { useState, useEffect } from 'react';
import '../../styling/popup.css';

interface DicePopupProps {
  open: boolean;
  onClose: () => void;
  availableCuisines: string[];
}

const DicePopup: React.FC<DicePopupProps> = ({ open, onClose, availableCuisines }) => {
  if (!open) return null;

  const [rolledCuisine, setRolledCuisine] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [diceFaces, setDiceFaces] = useState<string[]>([]);

  // Update dice faces when selected cuisines change
  useEffect(() => {
    if (selectedCuisines.length > 0) {
      // Create an array of 6 cuisines, cycling through the selected ones if needed
      const faces = Array(6).fill('').map((_, index) => {
        return selectedCuisines[index % selectedCuisines.length];
      });
      setDiceFaces(faces);
    } else {
      setDiceFaces(Array(6).fill('Click to roll'));
    }
  }, [selectedCuisines]);

  const handleCuisineToggle = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const rollDice = () => {
    if (selectedCuisines.length === 0) {
      alert('Please select at least one cuisine!');
      return;
    }
    setIsRolling(true);
    setRolledCuisine(null);

    // Wait for animation to complete before showing result
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * selectedCuisines.length);
      const selected = selectedCuisines[randomIndex];
      setRolledCuisine(selected);
      setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="dice-modal-overlay">
      <div className="dice-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>Roll a Dice</h2>

        {/* Cuisine Selection */}
        <div className="cuisine-selection">
          <h3>Select Cuisines</h3>
          <div className="cuisine-checkboxes">
            {availableCuisines.map((cuisine) => (
              <label key={cuisine} className="cuisine-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCuisines.includes(cuisine)}
                  onChange={() => handleCuisineToggle(cuisine)}
                />
                {cuisine}
              </label>
            ))}
          </div>
        </div>

        {/* 3D Dice */}
        <div className="dice-graphic" onClick={rollDice}>
          <div className={`dice ${isRolling ? 'rolling' : ''}`}>
            <div className="dice-face front">{rolledCuisine || diceFaces[0]}</div>
            <div className="dice-face back">{rolledCuisine || diceFaces[1]}</div>
            <div className="dice-face right">{rolledCuisine || diceFaces[2]}</div>
            <div className="dice-face left">{rolledCuisine || diceFaces[3]}</div>
            <div className="dice-face top">{rolledCuisine || diceFaces[4]}</div>
            <div className="dice-face bottom">{rolledCuisine || diceFaces[5]}</div>
          </div>
        </div>

        {/* Display Selected Cuisines */}
        <div className="cuisine-tags">
          {selectedCuisines.length > 0 ? (
            selectedCuisines.map((cuisine) => (
              <span key={cuisine} className="cuisine-tag">
                {cuisine}
                <button
                  className="tag-remove"
                  onClick={() => handleCuisineToggle(cuisine)}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <p>No cuisines selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DicePopup;
