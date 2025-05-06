import React, { useState } from 'react';
import '../../styling/popup.css';


interface DicePopupProps {
  open: boolean;
  onClose: () => void;
}

const DicePopup: React.FC<DicePopupProps> = ({ open, onClose }) => {
  if (!open) return null;

  const [rolledCuisine, setRolledCuisine] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const cuisines: string[] = ['Italian', 'French', 'Spanish', 'Chinese', 'Thai', 'Indian', 'German', 'Korean'];

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
    const randomIndex = Math.floor(Math.random() * selectedCuisines.length);
    const selected = selectedCuisines[randomIndex];
    setRolledCuisine(selected);
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
            {cuisines.map((cuisine) => (
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

        {/* Radius Dropdown */}
        <select className="radius-dropdown">
          <option>Select radius</option>
          <option>1 km</option>
          <option>5 km</option>
          <option>10 km</option>
        </select>

        {/* Dice Graphic */}
        <div className="dice-graphic" onClick={rollDice}>
          {rolledCuisine ? <p>{rolledCuisine}</p> : <p>Click to roll</p>}
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
