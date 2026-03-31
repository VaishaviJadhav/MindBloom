import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SoundSafariGame from "./SoundSafarigame"; // ← replaces SoundSafari

export default function Level1({ childId, onLevelComplete }) {
  const [xp, setXp] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  // Called when ALL 7 sound safari levels are done
  const handleAllLevelsDone = (fullHistory) => {
    console.log("🏆 All 7 levels complete! Full history:", fullHistory);
    setXp(prev => prev + 105); // 15 XP × 7 levels
    setShowComplete(true);
  };

  const finishLevel = () => {
    onLevelComplete?.(xp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 to-white p-6 flex flex-col items-center">

      {/* Header — only show when game is not active */}
      {showComplete && (
        <div className="w-full max-w-4xl mb-6">
          <h1 className="text-4xl font-black text-emerald-800 text-center">
            🌟 Level 1
          </h1>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!showComplete ? (

            // ── SoundSafariGame handles levels 1–7 internally ──
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <SoundSafariGame
                childId={childId}
                onAllComplete={handleAllLevelsDone}
              />
            </motion.div>

          ) : (

            // ── All 7 levels done — show completion screen ──
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center"
            >
              <h2 className="text-3xl font-bold text-emerald-700 mb-4">
                🎉 All Levels Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                You earned {xp} XP across all 7 Sound Safari levels!
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