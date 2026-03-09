import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import SoundSafari      from "./SoundSafari";       // Level 1 — hardcoded words
import SoundSafariLevel from "./SoundSafariLevel";  // Levels 2-7 — adaptive words

const SERVER_URL      = "http://localhost:8000";
const TOTAL_LEVELS    = 7;
const WORDS_PER_LEVEL = 5;

/* ── Between-level loading screen ── */
function LevelTransition({ nextLevel, accuracy }) {
  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "radial-gradient(ellipse at 50% 50%, rgba(5,35,10,1) 0%, #0a1f0a 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 24,
      fontFamily: "'Nunito', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
      <div style={{
        padding: "8px 28px", borderRadius: 50,
        background: "rgba(168,230,61,0.12)", border: "2px solid rgba(168,230,61,0.4)",
        fontFamily: "'Fredoka One', cursive", fontSize: "1rem", color: "#a8e63d", letterSpacing: 2,
      }}>
        LEVEL {nextLevel}
      </div>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        border: "4px solid rgba(168,230,61,0.15)",
        borderTop: "4px solid #a8e63d",
        animation: "spin 0.9s linear infinite",
      }} />
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "'Fredoka One', cursive", fontSize: "1.6rem",
          color: "#a8e63d", margin: "0 0 8px",
          textShadow: "0 0 20px rgba(168,230,61,0.4)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}>
          🤖 AI is planning your next level…
        </p>
        <p style={{ fontSize: "0.9rem", color: "#7ab860", margin: 0 }}>
          Based on your {Math.round(accuracy * 100)}% accuracy so far
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ORCHESTRATOR
══════════════════════════════════════════════════════ */
export default function SoundSafariGame({ onAllComplete, childId }) {

  const [currentLevel,       setCurrentLevel]       = useState(1);
  const [plannedWords,       setPlannedWords]        = useState(null);
  const [allHistory,         setAllHistory]          = useState([]);
  const [isTransitioning,    setIsTransitioning]     = useState(false);
  const [transitionAccuracy, setTransitionAccuracy]  = useState(0);
  const [gameComplete,       setGameComplete]        = useState(false);

  /* ── Fetch planned words for a level ── */
  const planNextLevel = async (levelNumber, history) => {
    console.log(`\n🎯 Planning level ${levelNumber} with ${history.length} history entries`);
    setIsTransitioning(true);

    const accuracy = history.length > 0
      ? history.filter(h => h.correct).length / history.length : 0;
    setTransitionAccuracy(accuracy);

    try {
      const res = await fetch(`${SERVER_URL}/game/plan-level`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ levelNumber, previousHistory: history, wordCount: WORDS_PER_LEVEL }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      console.log(`✅ Level ${levelNumber} words:`, data.words.map(w => `${w.word}(${w.level})`).join(", "));
      setPlannedWords(data.words);
    } catch (err) {
      console.error("❌ plan-level failed:", err);
      alert(`Could not load Level ${levelNumber}: ${err.message}`);
    } finally {
      setIsTransitioning(false);
    }
  };

  useEffect(() => {
    if (currentLevel > 1) planNextLevel(currentLevel, allHistory);
  }, [currentLevel]);

  /* ══════════════════════════════════════════════════════
     Save / update today's daily score
     Called after EVERY level completes
  ══════════════════════════════════════════════════════ */
  const saveDailyScore = async (newHistory) => {
    const cId = childId || localStorage.getItem("current_child_id");
    if (!cId) { console.error("❌ [DAILY] No child_id"); return; }

    // Compute aggregate score across all levels played so far today
    const correct  = newHistory.filter(h => h.correct).length;
    const accuracy = correct / newHistory.length;
    const weights  = { easy: 1, moderate: 1.5, hard: 2 };
    const wCorrect = newHistory.reduce((s, x) => s + (x.correct ? (weights[x.level] || 1) : 0), 0);
    const wTotal   = newHistory.reduce((s, x) => s + (weights[x.level] || 1), 0);
    const overallScore = parseFloat(((wCorrect / wTotal) * 100).toFixed(2));
    const phonoScore   = parseFloat((accuracy * 100).toFixed(2));

    // Check if a row already exists for today for this child
    const today = new Date().toISOString().split("T")[0]; // "2026-03-10"

    const { data: todayRow, error: todayErr } = await supabase
      .from("child_daily_scores")
      .select("id, day_number")
      .eq("child_id", cId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .maybeSingle();

    if (todayErr) console.warn("⚠️ [DAILY] today check error:", todayErr.message);

    if (todayRow) {
      // Already played today — update with latest cumulative score
      const { error: updateErr } = await supabase
        .from("child_daily_scores")
        .update({ phonological_score: phonoScore, overall_score: overallScore })
        .eq("id", todayRow.id);

      if (updateErr) console.error("❌ [DAILY] update failed:", updateErr.message);
      else console.log(`🔄 [DAILY] Day ${todayRow.day_number} updated — score ${overallScore}%`);
    } else {
      // First play today — insert new row with next day number
      const { data: lastDay } = await supabase
        .from("child_daily_scores")
        .select("day_number")
        .eq("child_id", cId)
        .order("day_number", { ascending: false })
        .limit(1);

      const dayNumber = lastDay?.length > 0 ? lastDay[0].day_number + 1 : 1;

      const { error: insertErr } = await supabase
        .from("child_daily_scores")
        .insert({ child_id: cId, day_number: dayNumber, phonological_score: phonoScore, overall_score: overallScore, reaction_time: null });

      if (insertErr) console.error("❌ [DAILY] insert failed:", insertErr.message);
      else console.log(`✅ [DAILY] Day ${dayNumber} inserted — score ${overallScore}%`);
    }
  };

  /* ══════════════════════════════════════════════════════
     Called when each level finishes
  ══════════════════════════════════════════════════════ */
  const handleLevelComplete = async (results) => {
    console.log(`✅ Level ${currentLevel} complete | ${results.length} answers`);

    const newHistory = [...allHistory, ...results];
    setAllHistory(newHistory);

    // ── Save/update today's daily score after every level ──
    await saveDailyScore(newHistory);

    if (currentLevel >= TOTAL_LEVELS) {
      console.log("🏆 All 7 levels complete!");
      setGameComplete(true);
      onAllComplete?.(newHistory);
    } else {
      setPlannedWords(null);
      setCurrentLevel(l => l + 1);
    }
  };

  /* ── All done screen ── */
  if (gameComplete) {
    const correct = allHistory.filter(h => h.correct).length;
    const total   = allHistory.length;
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 50%, rgba(5,35,10,1) 0%, #0a1f0a 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Nunito', sans-serif", gap: 20,
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap');`}</style>
        <p style={{ fontSize: "4rem", margin: 0 }}>🏆</p>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: "2.5rem", color: "#a8e63d", margin: 0 }}>
          Sound Safari Complete!
        </h1>
        <p style={{ color: "#7ab860", fontSize: "1.1rem" }}>
          {correct} out of {total} words correct across all 7 levels.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
            const lvlResults = allHistory.filter((_, idx) => Math.floor(idx / WORDS_PER_LEVEL) === i);
            const lCorrect   = lvlResults.filter(h => h.correct).length;
            return (
              <div key={i} style={{
                background: "rgba(168,230,61,0.1)", border: "1px solid rgba(168,230,61,0.25)",
                borderRadius: 12, padding: "12px 20px", textAlign: "center", minWidth: 80,
              }}>
                <p style={{ fontFamily: "'Fredoka One', cursive", color: "#a8e63d", fontSize: "1rem", margin: "0 0 4px" }}>
                  Level {i + 1}
                </p>
                <p style={{ color: "#7ab860", fontSize: "0.85rem", margin: 0 }}>
                  {lCorrect}/{lvlResults.length}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Between-level loading ── */
  if (isTransitioning || (currentLevel > 1 && !plannedWords)) {
    return <LevelTransition nextLevel={currentLevel} accuracy={transitionAccuracy} />;
  }

  /* ── Level 1: original SoundSafari ── */
  if (currentLevel === 1) {
    return <SoundSafari childId={childId} onComplete={handleLevelComplete} />;
  }

  /* ── Levels 2–7: adaptive words ── */
  return (
    <SoundSafariLevel
      key={currentLevel}
      levelNumber={currentLevel}
      words={plannedWords}
      childId={childId}
      onComplete={handleLevelComplete}
    />
  );
}