import React, { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meteor } from 'meteor/meteor';
import type { CustomUser } from "../types/User"; 

// Custom SVG Icons
const ThumbUpIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
  </svg>
);

const ThumbDownIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
  </svg>
);

// Defining type for dish object (temp)
type Dish = {
  id: number;
  name: string;
  image: string;
  description: string;
};


// Card component for displaying a dish with thumbs up/down buttons
const DishCard = ({ dish, onSwipe, badge }: { dish: Dish; onSwipe: (action: 'like' | 'dislike') => void; badge?: 'liked' | 'disliked' }) => {
  const [exitCondition, setExitCondition] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleSwipe = (action: 'like' | 'dislike') => {
    setExitCondition(action === 'like' ? 200 : -200);
    onSwipe(action);
  };
  
  return (
    <motion.div
      key={dish.id}
      className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: exitCondition }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}>

      {imageError || !dish.image ? (
        <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500">
          Image unavailable (limit reached)
        </div>
      ) : (
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-64 object-cover"
          onError={() => setImageError(true)}
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold text-[#4b2e19]">{dish.name}</h3>
        <p className="mt-2 text-[#4b2e19] text-sm">{dish.description}</p>
        {badge && (
          <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${badge === 'liked' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {badge === 'liked' ? 'Liked' : 'Disliked'}
          </span>
        )}
      </div>
      <div className="flex justify-around pb-4">
        <button onClick={() => handleSwipe('dislike')} className="w-1/2 mx-2 h-20 bg-red-200 hover:bg-red-300 text-red-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Dislike"><ThumbDownIcon /></button>
        <button onClick={() => handleSwipe('like')} className="w-1/2 mx-2 h-20 bg-green-200 hover:bg-green-300 text-green-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Like"><ThumbUpIcon /></button>
      </div>
    </motion.div>
  );
};


export const Discover = () => {
  const [liked, setLiked] = useState<Dish[]>([]);
  const [disliked, setDisliked] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [diversity, setDiversity] = useState<number>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('discover_diversity') : null;
    const parsed = stored != null ? Number(stored) : NaN;
    return Number.isFinite(parsed) ? parsed : 50;
  });
  const [tryNewQueue, setTryNewQueue] = useState<Dish[]>([]);
  const [recommendedQueue, setRecommendedQueue] = useState<Dish[]>([]);
  const [currentTryNew, setCurrentTryNew] = useState<Dish | null>(null);
  const [currentRecommended, setCurrentRecommended] = useState<Dish | null>(null);
  const [recommendedAvoid, setRecommendedAvoid] = useState<string[]>([]);
  const [tryNewAvoid, setTryNewAvoid] = useState<string[]>([]);
  const [clearing, setClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<string>('');
  const [occasionMenu, setOccasionMenu] = useState<{
    centerpiece: Dish | null;
    complements: Dish[];
  }>({ centerpiece: null, complements: [] });
  const [occasion, setOccasion] = useState<string>(() => {
    const s = typeof window !== 'undefined' ? window.localStorage.getItem('discover_occasion') : null;
    return s || '';
  });
  const [diningMode, setDiningMode] = useState<'out' | 'home'>(() => {
    const s = typeof window !== 'undefined' ? window.localStorage.getItem('discover_diningMode') : null;
    return (s === 'out' || s === 'home') ? s : 'out';
  });
  const [vibe, setVibe] = useState<string>(() => {
    const s = typeof window !== 'undefined' ? window.localStorage.getItem('discover_vibe') : null;
    return s || '';
  });

  useEffect(() => {
    const user = Meteor.user() as CustomUser | null;

    // Fetch liked dishes from the database and use as preferences for AI
    Meteor.call("dishes.getUserPreferences", (_err: unknown, likedDishes: string[]) => {
      const prefs = likedDishes && likedDishes.length > 0
        ? likedDishes
        : user?.profile?.preferences || [];

      setPreferences(prefs);
      prefetchSuggestions({ mode: 'recommended', preferences: prefs.join(','), avoid: recommendedAvoid }, setRecommendedQueue, setCurrentRecommended);
    });

    prefetchSuggestions({ mode: 'tryNew', diversity }, setTryNewQueue, setCurrentTryNew);
  }, []);

  // Persist diversity slider changes across sessions
  useEffect(() => {
    try {
      window.localStorage.setItem('discover_diversity', String(diversity));
    } catch {}
  }, [diversity]);

  useEffect(() => {
    try { window.localStorage.setItem('discover_occasion', occasion); } catch {}
  }, [occasion]);
  useEffect(() => {
    try { window.localStorage.setItem('discover_diningMode', diningMode); } catch {}
  }, [diningMode]);
  useEffect(() => {
    try { window.localStorage.setItem('discover_vibe', vibe); } catch {}
  }, [vibe]);

  const prefetchSuggestions = async (
    params: Record<string, any>,
    setQueue: React.Dispatch<React.SetStateAction<Dish[]>>,
    setCurrent: React.Dispatch<React.SetStateAction<Dish | null>>
  ) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/aiSuggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, avoid: params.mode === 'tryNew' ? tryNewAvoid : recommendedAvoid, userId: Meteor.userId?.() }),
      });

      if (!response.ok) throw new Error('AI suggestion failed');

      const data = await response.json();
      const dishes = (data.dishes || []) as Array<{ name: string; description: string }>;
      if (!Array.isArray(dishes) || dishes.length === 0) throw new Error('No dishes returned');

      // Generate images for all returned dishes in parallel
      const enriched = await Promise.all(
        dishes.slice(0, 5).map(async (d) => {
          try {
            const imageRes = await fetch('/api/generateImage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: d.name }),
            });
            if (!imageRes.ok) throw new Error('image gen failed');
            const imageData = await imageRes.json();
            const imageUrl = imageData.image
              ? `data:image/png;base64,${imageData.image}`
              : (imageData.imageUrl || '');
            return { id: Date.now() + Math.random(), name: d.name, description: d.description, image: imageUrl } as Dish;
          } catch {
            // Leave image empty so UI shows a clear placeholder
            return { id: Date.now() + Math.random(), name: d.name, description: d.description, image: '' } as Dish;
          }
        })
      );

      setQueue(enriched);
      setCurrent(enriched[0] ?? null);
      const newlySeenNames = enriched.map(d => d.name);
      if (params.mode === 'recommended') {
        setRecommendedAvoid(prev => [...prev, ...newlySeenNames].slice(-100));
      } else if (params.mode === 'tryNew') {
        setTryNewAvoid(prev => [...prev, ...newlySeenNames].slice(-100));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to get AI-generated dish.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOccasionMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/aiSuggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'occasion', occasion, diningMode, vibe, userId: Meteor.userId?.() }),
      });
      if (!response.ok) throw new Error('Occasion menu failed');
      const data = await response.json();
      const menu = data.menu as { centerpiece: { name: string; description: string }, complements: Array<{ name: string; description: string }> };

      const all = [menu.centerpiece, ...menu.complements];
      const withImages = await Promise.all(all.map(async (d) => {
        try {
          const imageRes = await fetch('/api/generateImage', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: d.name })
          });
          const ok = imageRes.ok; const imageData = await imageRes.json();
          const imageUrl = ok && (imageData.image ? `data:image/png;base64,${imageData.image}` : (imageData.imageUrl || ''));
          return { id: Date.now() + Math.random(), name: d.name, description: d.description, image: imageUrl || '' } as Dish;
        } catch {
          return { id: Date.now() + Math.random(), name: d.name, description: d.description, image: '' } as Dish;
        }
      }));

      const [centerpiece, ...complements] = withImages;
      setOccasionMenu({ centerpiece: centerpiece ?? null, complements });
    } catch (e) {
      console.error(e);
      setError('Failed to get occasion menu.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (clearing) return;
    setClearing(true);
    setClearMessage('');
    Meteor.call('dishes.clearHistory', (err: unknown, res: { deletedCount: number }) => {
      setClearing(false);
      if (err) {
        console.error('Failed to clear history', err);
        setClearMessage('Could not clear history. Please try again.');
        return;
      }
      setLiked([]);
      setDisliked([]);
      setRecommendedAvoid([]);
      setTryNewAvoid([]);
      setClearMessage(`Cleared history (${res?.deletedCount ?? 0} items removed).`);
    });
  };

  //function to handle preferences and update lists
  // const handlePreference = (action: 'like' | 'dislike') => {
  //   const dish = sampleDishes[currentIndex];


  //   if (action === 'like') setLiked([...liked, dish]);
  //   if (action === 'dislike') setDisliked([...disliked, dish]);
  //   setCurrentIndex((prev) => prev + 1);
  // };

const handlePreference = (action: 'like' | 'dislike', dish: Dish | null) => {
    if (!dish) return;
    if (action === 'like') setLiked((prev) => [...prev, dish]);
    if (action === 'dislike') setDisliked((prev) => [...prev, dish]);
    Meteor.call('dishes.swipe', { name: dish.name, liked: action === 'like' }, (err: unknown) => {
      if (err) console.error('Swipe save failed', err);
    });
  };

 const handleSwipeFromQueue = (
    action: 'like' | 'dislike',
    queue: Dish[],
    setQueue: React.Dispatch<React.SetStateAction<Dish[]>>,
    current: Dish | null,
    setCurrent: React.Dispatch<React.SetStateAction<Dish | null>>,
    prefetchParams: Record<string, any>
  ) => {
    handlePreference(action, current);
    const [, ...rest] = queue;
    if (rest.length === 0) {
      // Refill queue
      prefetchSuggestions(prefetchParams, setQueue, setCurrent);
    } else {
      setQueue(rest);
      setCurrent(rest[0]);
    }
  };
  
  

  return (
    <div className="flex min-h-screen pt-20 bg-[#fdfaf7]">
      <div className="flex flex-col flex-1 pb-8 px-4 sm:px-6 space-y-12">
        {/* Page heading */}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#4b2e19] mb-2">Discover</h1>
        </div>

        {/*try me section*/}
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-[#4b2e19]">Try New</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#7a5c43]">Classic</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={diversity}
                onChange={(e) => setDiversity(Number(e.target.value))}
                className="w-40 accent-[#c07a45]"
                aria-label="Diversity slider"
              />
              <span className="text-sm text-[#7a5c43]">Adventurous</span>
              <span className="text-sm text-[#7a5c43] ml-1">{diversity}</span>
              <button
                onClick={clearHistory}
                disabled={clearing}
                className={`ml-4 px-3 py-1 rounded-lg text-xs border ${clearing ? 'opacity-60 cursor-not-allowed bg-[#f3ebe5] text-[#a08a78] border-[#e2cfc3]' : 'bg-[#f0e0d6] text-[#7a5c43] border-[#e2cfc3] hover:bg-[#e8d6c9]'}`}
                aria-label="Clear liked/disliked history"
              >{clearing ? 'Clearing…' : 'Clear history'}</button>
            </div>
          </div>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 min-h-[200px] text-[#7a5c43]">
            {clearMessage && (
              <div className="mb-3 text-xs text-[#6b4e38]" aria-live="polite">{clearMessage}</div>
            )}
            <AnimatePresence>
              {currentTryNew ? (
                <DishCard
                  key={currentTryNew.id}
                  dish={currentTryNew}
                  badge={liked.some(d => d.name === currentTryNew.name) ? 'liked' : (disliked.some(d => d.name === currentTryNew.name) ? 'disliked' : undefined)}
                  onSwipe={(action) =>
                    handleSwipeFromQueue(
                      action,
                      tryNewQueue,
                      setTryNewQueue,
                      currentTryNew,
                      setCurrentTryNew,
                      { mode: 'tryNew', diversity }
                    )
                  }
                />
              ) : (
                <p className="text-lg">Generating a dish recommendation...</p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recommended Dish placeholder */}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Recommended for You</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 min-h-[200px] text-[#7a5c43]">
            <AnimatePresence>
              {currentRecommended ? (
                <DishCard
                  key={currentRecommended.id}
                  dish={currentRecommended}
                  badge={liked.some(d => d.name === currentRecommended.name) ? 'liked' : (disliked.some(d => d.name === currentRecommended.name) ? 'disliked' : undefined)}
                  onSwipe={(action) =>
                    handleSwipeFromQueue(
                      action,
                      recommendedQueue,
                      setRecommendedQueue,
                      currentRecommended,
                      setCurrentRecommended,
                      { mode: 'recommended', preferences: preferences.join(','), avoid: recommendedAvoid }
                    )
                  }
                />
              ) : (
                <p className="text-lg">Generating a dish recommendation...</p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Special Occasion */}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Special Occasion</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 text-[#7a5c43]">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {['Birthday','Anniversary','Date night','Family dinner','Friends gathering'].map((o) => (
                <button
                  key={o}
                  onClick={() => setOccasion(o)}
                  className={`px-3 py-1 rounded-full border ${occasion === o ? 'bg-[#c07a45] text-white border-[#c07a45]' : 'border-[#e2cfc3] bg-white text-[#7a5c43]'} text-sm`}
                >{o}</button>
              ))}
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDiningMode('out')}
                    className={`px-2 py-1 rounded-full text-xs border ${diningMode==='out'?'bg-[#c07a45] text-white border-[#c07a45]':'border-[#e2cfc3] bg-white text-[#7a5c43]'}`}
                    aria-label="Dining out"
                  >Dining out</button>
                  <button
                    onClick={() => setDiningMode('home')}
                    className={`px-2 py-1 rounded-full text-xs border ${diningMode==='home'?'bg-[#c07a45] text-white border-[#c07a45]':'border-[#e2cfc3] bg-white text-[#7a5c43]'}`}
                    aria-label="At home"
                  >At home</button>
                </div>
                <select
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="text-sm border border-[#e2cfc3] rounded-lg bg-white px-2 py-1"
                  aria-label="Vibe"
                >
                  <option value="">Vibe</option>
                  <option value="Cozy">Cozy</option>
                  <option value="Fancy">Fancy</option>
                  <option value="Fun">Fun</option>
                </select>
                <button
                  onClick={fetchOccasionMenu}
                  className="px-3 py-2 rounded-lg bg-[#c07a45] text-white text-sm shadow hover:opacity-90"
                >Get occasion menu</button>
              </div>
            </div>

            {occasionMenu.centerpiece ? (
              <div>
                <h3 className="text-lg font-semibold text-[#4b2e19] mb-2">Centerpiece</h3>
                <DishCard dish={occasionMenu.centerpiece} onSwipe={() => {}} />
                {occasionMenu.complements.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-[#4b2e19] mb-2">Complements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {occasionMenu.complements.map((d) => (
                        <DishCard key={d.id} dish={d} onSwipe={() => {}} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm">Pick an occasion and tap "Get occasion menu".</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};