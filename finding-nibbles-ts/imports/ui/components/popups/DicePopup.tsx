import React, { useState } from 'react';
import '../../styling/popup.css';

interface DicePopupProps {
  open: boolean;
  onClose: () => void;
}

const DicePopup: React.FC<DicePopupProps> = ({ open, onClose }) => {
  if (!open) return null;

  const allCuisines = [
    'Italian',
    'French',
    'Spanish',
    'Chinese',
    'Thai',
    'Indian',
    'German',
    'Korean',
  ]; // Full list of cuisines

  const [rolledCuisine, setRolledCuisine] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    'Italian',
    'French',
    'Spanish',
    'Chinese',
    'Thai',
    'Indian',
    'German',
    'Korean',
  ]); // Default cuisines

  const rollDice = () => {
    if (selectedCuisines.length === 0) {
      alert('No cuisines available to roll!');
      return;
    }
    const randomIndex = Math.floor(Math.random() * selectedCuisines.length);
    const selected = selectedCuisines[randomIndex];
    setRolledCuisine(selected);
  };

  const handleRemoveCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) => prev.filter((c) => c !== cuisine));
  };

  const handleAddCuisine = (cuisine: string) => {
    if (!selectedCuisines.includes(cuisine)) {
      setSelectedCuisines((prev) => [...prev, cuisine]);
    }
  };

  return (
    <div className="dice-modal-overlay">
      <div className="dice-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>Roll a Dice</h2>

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
                  onClick={() => handleRemoveCuisine(cuisine)}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <p>No cuisines available</p>
          )}
        </div>

        {/* Add Cuisines Back */}
        <div className="add-cuisines">
          <h3>Add Cuisines</h3>
          {allCuisines
            .filter((cuisine) => !selectedCuisines.includes(cuisine))
            .map((cuisine) => (
              <button
                key={cuisine}
                className="add-cuisine-button"
                onClick={() => handleAddCuisine(cuisine)}
              >
                {cuisine}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DicePopup;