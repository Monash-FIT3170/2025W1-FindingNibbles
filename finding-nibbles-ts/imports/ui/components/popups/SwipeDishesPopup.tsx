import React, { useState, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Meteor } from 'meteor/meteor';
import './SwipeDishesPopup.css';

interface Dish {
  _id: string;
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

  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (current >= dishes.length) return;
    const dish = dishes[current];
    Meteor.call('dishes.swipe', dish._id, dir === 'right' ? 'like' : 'dislike');
    setAnim(dir);
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

  if (current >= dishes.length) {
    return (
      <div className="swipe-popup-overlay">
        <div className="swipe-popup-card">
          <h2>No more dishes!</h2>
          <button onClick={onClose}>Close</button>
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
      </div>
    </div>
  );
};

export default SwipeDishesPopup;
