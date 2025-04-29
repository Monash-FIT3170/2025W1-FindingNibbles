import React, { useState } from 'react';

const DicePopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [rolledCuisine, setRolledCuisine] = useState(null);
  const [selectedCuisines, setSelectedCuisines] = useState([]); // State for selected cuisines

  const cuisines = ['Italian', 'French', 'Spanish', 'Chinese', 'Thai', 'Indian', 'German', 'Korean'];

  const handleCuisineToggle = (cuisine) => {
    console.log('Toggling cuisine:', cuisine);
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const rollDice = () => {
    console.log('Rolling dice, selectedCuisines:', selectedCuisines);
    if (selectedCuisines.length === 0) {
      alert('Please select at least one cuisine!');
      return;
    }
    const randomIndex = Math.floor(Math.random() * selectedCuisines.length);
    setRolledCuisine(selectedCuisines[randomIndex]);
    console.log('Rolled cuisine:', selectedCuisines[randomIndex]);
  };

  console.log('Rendering DicePopup, showPopup:', showPopup, 'rolledCuisine:', rolledCuisine, 'selectedCuisines:', selectedCuisines);

  return (
    <>
      <button
        className="menu-button"
        onClick={() => {
          console.log('Opening popup');
          setShowPopup(true);
        }}
      >
        Roll a dice
      </button>

      {showPopup && (
        <div className="dice-modal-overlay">
          <div className="dice-modal">
            <button
              className="close-button"
              onClick={() => {
                console.log('Closing popup');
                setShowPopup(false);
              }}
            >
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

            <select className="radius-dropdown">
              <option>Select radius</option>
              <option>1 km</option>
              <option>5 km</option>
              <option>10 km</option>
            </select>

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
      )}
    </>
  );
};

export default DicePopup;