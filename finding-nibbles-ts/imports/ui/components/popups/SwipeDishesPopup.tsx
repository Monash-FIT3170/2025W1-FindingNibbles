
import React, { useState, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Meteor } from 'meteor/meteor';
import './SwipeDishesPopup.css';

// Dish type for Gemini API dishes
interface Dish {
  id: string; // Gemini dishes may use 'id' instead of '_id'
  name: string;
  image?: string;
  description?: string;
}

interface SwipeDishesPopupProps {
  dishes: Dish[];
  onClose: () => void;
}

const SwipeDishesPopup: React.FC<SwipeDishesPopupProps> = ({ dishes, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [anim, setAnim] = useState('');
  const [swiped, setSwiped] = useState(false); // Track if at least one swipe was made

  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (current >= dishes.length) return;
    const dish = dishes[current];
    // Use id or _id for DB
    const dishId = dish.id || (dish as any)._id;
    Meteor.call('dishes.swipe', dishId, dir === 'right' ? 'like' : 'dislike');
    setAnim(dir);
    setSwiped(true);
    setTimeout(() => {
      setAnim('');
      setCurrent((c) => c + 1);
    }, 300);
  }, [current, dishes]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // All dishes swiped
  if (current >= dishes.length) {
    return (
      <div className="swipe-popup-overlay">
        <div className="swipe-popup-card">
          <h2>No more dishes!</h2>
          <button onClick={onClose} disabled={!swiped} style={{ opacity: swiped ? 1 : 0.5 }}>
            Close
          </button>
          {!swiped && <p style={{ color: 'red', marginTop: 8 }}>Swipe at least one dish to close</p>}
        </div>
      </div>
    );
  }

  const dish = dishes[current];

  return (
    <div className="swipe-popup-overlay">
      <div className={`swipe-popup-card ${anim}`} {...handlers}>
        {dish.image && <img src={dish.image} alt={dish.name} className="swipe-popup-img" />}
        <h2>{dish.name}</h2>
        <p>{dish.description}</p>
        <div className="swipe-popup-actions">
          <button onClick={() => handleSwipe('left')}>Dislike</button>
          <button onClick={() => handleSwipe('right')}>Like</button>
        </div>
        <button
          onClick={onClose}
          disabled={!swiped}
          style={{ marginTop: 16, opacity: swiped ? 1 : 0.5 }}
        >
          Close
        </button>
        {!swiped && <p style={{ color: 'red', marginTop: 8 }}>Swipe at least one dish to close</p>}
      </div>
    </div>
  );
};

export default SwipeDishesPopup;
