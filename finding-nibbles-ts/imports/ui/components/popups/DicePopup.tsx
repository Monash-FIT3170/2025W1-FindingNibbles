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
      // Create an array of 6 different cuisines
      let faces = [...selectedCuisines];
      // If we have less than 6 cuisines, cycle through them
      while (faces.length < 6) {
        faces = [...faces, ...selectedCuisines.slice(0, 6 - faces.length)];
      }
      // Shuffle the faces to ensure different cuisines on each face
      faces = faces.slice(0, 6).sort(() => Math.random() - 0.5);
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
      alert('No cuisines available to roll!');
      return;
    }
    setIsRolling(true);
    setRolledCuisine(null);

    setTimeout(() => {
      // Pick the rolled cuisine
      const randomIndex = Math.floor(Math.random() * selectedCuisines.length);
      const selected = selectedCuisines[randomIndex];
      setRolledCuisine(selected);
      setIsRolling(false);

      // Remove rolled cuisine and shuffle the rest
      const otherCuisines = selectedCuisines.filter(c => c !== selected);
      let shuffled = [...otherCuisines].sort(() => Math.random() - 0.5);
      // Pick unique for right and top
      const rightFace = shuffled[0] || selected;
      const topFace = shuffled[1] && shuffled[1] !== rightFace ? shuffled[1] : (shuffled[2] || selected);

      // Fill the rest (back, left, bottom) with any cuisines (can repeat if not enough)
      let used = [selected, rightFace, topFace];
      let rest = shuffled.filter(c => !used.includes(c));
      while (used.length < 6) {
        used.push(rest.shift() || selected);
      }
      // Dice face order: front, right, back, left, top, bottom
      setDiceFaces([selected, rightFace, used[3], used[4], topFace, used[5]]);
    }, 1000);
  };

  const handleRemoveCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) => prev.filter((c) => c !== cuisine));
  };

  return (
    <div className="dice-modal-overlay">
      <div className="dice-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>Roll the Dice</h2>

        {/* Available Cuisines Section */}
        <div className="cuisine-selection">
          <h3>Nearby Cuisines</h3>
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
            <div className="dice-face back">{diceFaces[1]}</div>
            <div className="dice-face right">{diceFaces[2]}</div>
            <div className="dice-face left">{diceFaces[3]}</div>
            <div className="dice-face top">{diceFaces[4]}</div>
            <div className="dice-face bottom">{diceFaces[5]}</div>
          </div>
        </div>

        {/* Selected Cuisines Section */}
        <div className="selected-cuisines-section">
          <h3>Selected Cuisines</h3>
          <div className="selected-cuisines">
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
              <p>No cuisines selected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DicePopup;