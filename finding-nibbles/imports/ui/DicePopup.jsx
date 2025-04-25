import React, { useState } from 'react';

const DicePopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [rolledCuisine, setRolledCuisine] = useState(null);

  const cuisines = ['Italian', 'French', 'Spanish', 'Chinese', 'Thai', 'Indian', 'German', 'Korean'];

  const rollDice = () => {
    const randomIndex = Math.floor(Math.random() * cuisines.length);
    setRolledCuisine(cuisines[randomIndex]);
  };

  return (
    <>
      <button className="menu-button" onClick={() => setShowPopup(true)}>
        Roll a dice
      </button>

      {showPopup && (
        <div className="dice-modal-overlay">
          <div className="dice-modal">
            <button className="close-button" onClick={() => setShowPopup(false)}>×</button>

            <h2>Roll a dice</h2>

            <select className="radius-dropdown">
              <option>Select radius</option>
              <option>1 km</option>
              <option>5 km</option>
              <option>10 km</option>
            </select>

            <div className="dice-graphic" onClick={rollDice}>
              {rolledCuisine ? <p>{rolledCuisine}</p> : <p>Click to roll</p>}
            </div>

            <div className="cuisine-tags">
              {cuisines.map((cuisine) => (
                <span key={cuisine} className="cuisine-tag">
                  {cuisine} <button className="tag-remove">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DicePopup;
