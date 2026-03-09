import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// import MirrorMatch from "./MirrorMatch";
import SoundSafari from "./SoundSafari";
// import MemoryQuest from "./MemoryQuest";

export default function Level1({ childId, onLevelComplete }) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [xp, setXp] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const challenges = [
    // {
    //   id: 1,
    //   name: "Mirror Match",
    //   component: <MirrorMatch onComplete={() => next(10)} />
    // },
    {
      id: 2,
      name: "Sound Safari",
      component: <SoundSafari onComplete={() => next(15)} />
     }
    // {
    //   id: 3,
    //   name: "Memory Quest",
    //   component: <MemoryQuest onComplete={() => next(20)} />
    // }
  ];

  const next = (earnedXp) => {
    setXp(prev => prev + earnedXp);

    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
    } else {
      setShowComplete(true);
    }
  };

  const finishLevel = () => {
    onLevelComplete(xp);
  };

  const progress =
    ((currentChallenge + 1) / challenges.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 to-white p-6 flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <h1 className="text-4xl font-black text-emerald-800 text-center">
          🌟 Level 1
        </h1>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-emerald-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>
            Challenge {currentChallenge + 1} of {challenges.length}
          </span>
          <span>XP: {xp}</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8">

        <AnimatePresence mode="wait">
          {!showComplete ? (
            <motion.div
              key={currentChallenge}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {challenges[currentChallenge].component}
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-emerald-700 mb-4">
                🎉 Level Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                You earned {xp} XP!
              </p>

              <button
                onClick={finishLevel}
                className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition"
              >
                Continue Journey
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}