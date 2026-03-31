import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";
import Swal from "sweetalert2";

/* ══════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap');

  * { cursor: none !important; }

  .safari-root {
    min-height: 100vh; width: 100%;
    background:
      radial-gradient(ellipse at 20% 80%, rgba(20,80,20,0.9) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(10,60,30,0.8) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 50%, rgba(5,35,10,1) 0%, #0a1f0a 100%);
    font-family: 'Nunito', sans-serif;
    overflow: hidden; position: relative;
    box-sizing: border-box; padding: 28px 24px;
  }

  .leaf { position:absolute; pointer-events:none; opacity:0.18; font-size:80px; }
  .leaf-tl { top:-10px; left:-10px;  animation:sway  6s ease-in-out infinite; }
  .leaf-tr { top:-10px; right:-10px; animation:swayR 7s ease-in-out infinite; }
  .leaf-bl { bottom:-10px; left:-10px;  animation:swayB 8s ease-in-out infinite; }
  .leaf-br { bottom:-10px; right:-10px; animation:swayBR 5s ease-in-out infinite; }
  .leaf-ml { top:40%; left:-20px;  font-size:60px; animation:sway 9s ease-in-out infinite; }
  .leaf-mr { top:35%; right:-20px; font-size:60px; animation:swayR 6.5s ease-in-out infinite; }
  @keyframes sway   { 0%,100%{transform:rotate(-4deg)}  50%{transform:rotate(4deg)} }
  @keyframes swayR  { 0%,100%{transform:scaleX(-1) rotate(-4deg)} 50%{transform:scaleX(-1) rotate(4deg)} }
  @keyframes swayB  { 0%,100%{transform:scaleY(-1) rotate(4deg)}  50%{transform:scaleY(-1) rotate(-4deg)} }
  @keyframes swayBR { 0%,100%{transform:scale(-1,-1) rotate(-3deg)} 50%{transform:scale(-1,-1) rotate(5deg)} }

  .firefly { position:absolute; width:5px; height:5px; border-radius:50%;
    background:#c8f542; pointer-events:none; opacity:0; box-shadow:0 0 6px 2px #c8f54288;
    animation:fly var(--dur,8s) ease-in-out infinite var(--dly,0s); }
  @keyframes fly {
    0%  { opacity:0; transform:translate(0,0); }
    20% { opacity:0.9; }
    50% { opacity:0.5; transform:translate(var(--dx,30px),var(--dy,-40px)); }
    80% { opacity:0.8; }
    100%{ opacity:0;   transform:translate(var(--dx2,60px),var(--dy2,20px)); }
  }

  .vine-track { width:100%; height:14px; background:rgba(255,255,255,0.08);
    border-radius:8px; overflow:hidden; border:1px solid rgba(100,200,80,0.2); }
  .vine-fill  { height:100%; background:linear-gradient(90deg,#3ecf45,#a8e63d);
    border-radius:8px; transition:width 0.5s ease; box-shadow:0 0 8px #6ef04288; }

  .options-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:32px; }

  .option-btn {
    font-family:'Fredoka One',cursive; font-size:1.5rem; letter-spacing:1px;
    padding:22px 12px; border-radius:16px;
    border:2px solid rgba(100,210,80,0.35);
    background:rgba(10,45,15,0.75); color:#d4f5a0;
    transition:border-color 0.1s, background 0.1s, box-shadow 0.1s, transform 0.1s;
    backdrop-filter:blur(6px);
    box-shadow:0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
    position:relative; overflow:visible;
    animation:floatOpt var(--opt-dur,3.2s) ease-in-out infinite var(--opt-dly,0s);
  }
  .option-btn.aimed {
    border-color:#f5e642 !important; background:rgba(30,80,10,0.92) !important;
    box-shadow:0 0 30px rgba(245,230,66,0.45), 0 4px 16px rgba(0,0,0,0.4) !important;
    transform:scale(1.05) !important; animation:none !important;
  }
  .option-btn.correct {
    background:rgba(20,120,20,0.95) !important; border-color:#6ef042 !important;
    color:#f5ffc8 !important; box-shadow:0 0 28px rgba(110,240,66,0.55) !important;
    animation:pulseCor 0.5s ease !important;
  }
  .option-btn.wrong {
    background:rgba(120,20,20,0.95) !important; border-color:#f04242 !important;
    color:#ffc8c8 !important; box-shadow:0 0 20px rgba(240,66,66,0.4) !important;
    animation:shake 0.4s ease !important;
  }
  .option-btn:disabled { opacity:0.85; }

  @keyframes floatOpt { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes pulseCor { 0%{transform:scale(1)} 50%{transform:scale(1.07)} 100%{transform:scale(1)} }
  @keyframes shake {
    0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
  }

  .bang-burst {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    pointer-events:none; z-index:100; font-family:'Fredoka One',cursive;
    font-size:2rem; white-space:nowrap; color:#f5e642;
    text-shadow:0 0 14px #f5e64299; animation:bangPop 0.55s ease forwards;
  }
  @keyframes bangPop {
    0%  { transform:translate(-50%,-50%) scale(0.2) rotate(-15deg); opacity:1; }
    40% { transform:translate(-50%,-50%) scale(1.5) rotate(5deg); opacity:1; }
    100%{ transform:translate(-50%,-50%) scale(1.1) rotate(0deg); opacity:0; }
  }

  .gun-layer { position:fixed; top:0; left:0; width:100vw; height:100vh;
    pointer-events:none; z-index:9999; }

  .muzzle-flash { position:absolute; width:50px; height:50px; border-radius:50%;
    background:radial-gradient(circle,#fff9c4 0%,#f5e642 35%,transparent 70%);
    transform:translate(-50%,-50%); animation:flash 0.2s ease forwards; }
  @keyframes flash {
    0%  { opacity:1; transform:translate(-50%,-50%) scale(0.3); }
    50% { opacity:1; transform:translate(-50%,-50%) scale(1.6); }
    100%{ opacity:0; transform:translate(-50%,-50%) scale(2.2); }
  }

  .xhair-ring { position:absolute; width:28px; height:28px; border-radius:50%;
    border:2px solid rgba(245,230,66,0.7); transform:translate(-50%,-50%);
    pointer-events:none; }
  .xhair-dot  { position:absolute; width:6px; height:6px; border-radius:50%;
    background:#f5e642; box-shadow:0 0 8px 2px #f5e64299;
    transform:translate(-50%,-50%); pointer-events:none; }

  .play-btn {
    font-family:'Fredoka One',cursive; font-size:1.1rem; letter-spacing:1px;
    padding:10px 24px; border-radius:50px; border:2px solid rgba(245,230,66,0.5);
    background:rgba(30,70,10,0.8); color:#f5e642;
    transition:all 0.2s ease; box-shadow:0 3px 12px rgba(0,0,0,0.4);
  }
  .play-btn:hover { background:rgba(50,110,15,0.95); transform:scale(1.05); }

  .feedback-banner {
    text-align:center; border-radius:14px; padding:16px; margin-top:24px;
    background:rgba(0,0,0,0.35); border:1px solid rgba(100,210,80,0.2);
    backdrop-filter:blur(6px); animation:fadeUp 0.3s ease;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .next-btn {
    font-family:'Fredoka One',cursive; font-size:1.2rem; padding:12px 36px;
    border-radius:50px; border:none;
    background:linear-gradient(135deg,#3ecf45,#a8e63d); color:#0a2a0a;
    box-shadow:0 4px 16px rgba(110,240,66,0.35); transition:all 0.2s ease;
    animation:pulseBtn 2s ease-in-out infinite;
  }
  .next-btn:hover:not(:disabled) { transform:scale(1.07); }
  .next-btn:disabled { opacity:0.6; }
  @keyframes pulseBtn { 0%,100%{box-shadow:0 4px 16px rgba(110,240,66,0.35)} 50%{box-shadow:0 4px 28px rgba(110,240,66,0.65)} }

  .safari-header { font-family:'Fredoka One',cursive; font-size:2rem; color:#a8e63d;
    text-shadow:0 0 20px rgba(168,230,61,0.5); letter-spacing:2px; margin:0; }
  .child-tag { display:inline-flex; align-items:center; gap:6px; padding:5px 14px;
    border-radius:50px; background:rgba(255,255,255,0.07); border:1px solid rgba(168,230,61,0.25);
    font-size:0.85rem; color:#a8d580; }
  .level-badge { display:inline-block; font-size:0.75rem; font-family:'Fredoka One',cursive;
    padding:3px 10px; border-radius:20px; letter-spacing:1px; text-transform:uppercase; }
  .level-easy     { background:rgba(60,200,60,0.2);  color:#7ef07e; border:1px solid rgba(60,200,60,0.3); }
  .level-moderate { background:rgba(220,180,0,0.2);  color:#f0d060; border:1px solid rgba(220,180,0,0.3); }
  .level-hard     { background:rgba(220,60,60,0.2);  color:#f08080; border:1px solid rgba(220,60,60,0.3); }
`;

const FIREFLIES = Array.from({ length: 12 }, (_, i) => ({
  id: i, left: `${8 + Math.random() * 84}%`, top: `${8 + Math.random() * 84}%`,
  dur: `${6 + Math.random() * 8}s`, dly: `${Math.random() * 6}s`,
  dx: `${(Math.random() - 0.5) * 80}px`, dy: `${(Math.random() - 0.5) * 80}px`,
  dx2: `${(Math.random() - 0.5) * 120}px`, dy2: `${(Math.random() - 0.5) * 80}px`,
}));
const OPT_FLOATS = [
  { dur: "3.2s", dly: "0s" }, { dur: "2.8s", dly: "0.4s" },
  { dur: "3.6s", dly: "0.2s" }, { dur: "2.5s", dly: "0.6s" },
];

function GunSVG() {
  return (
    <svg width="130" height="70" viewBox="0 0 130 70" style={{ display: "block" }}>
      <rect x="28" y="22" width="90" height="11" rx="3" fill="#7a5c14" />
      <rect x="55" y="20" width="61" height="4" rx="2" fill="#5c440f" />
      <rect x="34" y="13" width="68" height="19" rx="3.5" fill="#b8b8b8" />
      <rect x="34" y="13" width="68" height="19" rx="3.5" fill="none" stroke="#888" strokeWidth="1.2" />
      {[37, 41, 45, 49].map(x => (
        <line key={x} x1={x} y1="15" x2={x} y2="31" stroke="#777" strokeWidth="1.8" />
      ))}
      <rect x="56" y="15" width="16" height="6" rx="1.5" fill="#888" opacity="0.6" />
      <rect x="94" y="11" width="4" height="4" rx="1" fill="#555" />
      <rect x="37" y="11" width="4" height="4" rx="1" fill="#555" />
      <rect x="114" y="18" width="10" height="12" rx="2" fill="#999" />
      <circle cx="119" cy="24" r="3.5" fill="#222" />
      <path d="M44 32 Q48 48 62 48 L70 48 Q62 48 58 32Z" fill="#5c440f" />
      <rect x="38" y="32" width="23" height="27" rx="4" fill="#6b4a12" />
      <rect x="40" y="34" width="19" height="23" rx="3" fill="#8b6018" />
      {[37, 41, 45, 49, 53].map(y => (
        <line key={y} x1="41" y1={y} x2="58" y2={y} stroke="#6b4a12" strokeWidth="1.2" />
      ))}
      <path d="M34 13 L29 8 L36 9 Z" fill="#999" />
      <rect x="51" y="35" width="4" height="10" rx="2" fill="#888" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function SoundSafari({ onComplete, childId }) {

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const [isLoadingML, setIsLoadingML] = useState(false);
  const [childData, setChildData] = useState(null);
  const [aimedIdx, setAimedIdx] = useState(null);
  const [bangIdx, setBangIdx] = useState(null);
  const [flashPos, setFlashPos] = useState(null);

  const xhairRingRef = useRef(null);
  const xhairDotRef = useRef(null);
  const gunWrapRef = useRef(null);
  const btnRefs = useRef([null, null, null, null]);
  const mousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef = useRef(null);
  const showFeedbackRef = useRef(false);
  const aimedIdxRef = useRef(null);
  const currentWordRef = useRef(null);
  const gameResultsRef = useRef([]);

  const questionStartTimeRef = useRef(Date.now());
  const reactionTimesRef = useRef([]);

  useEffect(() => { showFeedbackRef.current = showFeedback; }, [showFeedback]);
  useEffect(() => { gameResultsRef.current = gameResults; }, [gameResults]);

  /* ── GAME DATA ── */
  const level1Words = [
    { word: "said", options: ["sed", "sad", "said", "sid"], level: "easy" },
    { word: "was", options: ["was", "waz", "wus", "vas"], level: "easy" },
    { word: "have", options: ["hav", "have", "haf", "hev"], level: "easy" },
    { word: "what", options: ["what", "wot", "wut", "hwat"], level: "moderate" },
    { word: "come", options: ["kum", "come", "com", "coom"], level: "moderate" },
  ];

  useEffect(() => {
    setCurrentWord(level1Words[0]);
    currentWordRef.current = level1Words[0];
  }, []);

  const progress = (currentWordIndex / level1Words.length) * 100;
  const isLast = currentWordIndex === level1Words.length - 1;

  useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);
  useEffect(() => { questionStartTimeRef.current = Date.now(); }, [currentWordIndex]);

  /* ── CHILD FETCH ── */
  useEffect(() => {
    const effectiveChildId = childId || localStorage.getItem("current_child_id");
    console.log("🔍 [CHILD FETCH] effectiveChildId:", effectiveChildId);
    if (!effectiveChildId) {
      console.warn("⚠️ [CHILD FETCH] No child ID found — check prop or localStorage");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from("children")
          .select("id, parent_id, name, age, gender, language")
          .eq("id", effectiveChildId)
          .single();
        if (error) {
          console.error("❌ [CHILD FETCH] Supabase error:", error);
          return;
        }
        console.log("✅ [CHILD FETCH] childData loaded:", data);
        setChildData(data);
      } catch (err) {
        console.error("❌ [CHILD FETCH] Exception:", err);
      }
    })();
  }, [childId]);

  /* ── AUDIO ── */
  const speakWord = (word) => {
    window.speechSynthesis.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(word);
      u.rate = 0.5; u.pitch = 1.2; u.volume = 1.0;
      window.speechSynthesis.speak(u);
    }, 120);
  };

  useEffect(() => {
    if (!currentWord) return;
    speakWord(currentWord.word);
  }, [currentWord]);

  const playWordAgain = () => { if (currentWord) speakWord(currentWord.word); };

  /* ── RAF LOOP ── */
  useEffect(() => {
    const getPivot = () => ({ x: window.innerWidth / 2, y: window.innerHeight - 70 });
    const BARREL_TIP_X = 119, BARREL_TIP_Y = 24;

    const tick = () => {
      const { x: mx, y: my } = mousePosRef.current;
      const pivot = getPivot();
      const rawAngle = Math.atan2(my - pivot.y, mx - pivot.x) * (180 / Math.PI);
      const angle = Math.max(-75, Math.min(5, rawAngle));

      if (xhairRingRef.current) { xhairRingRef.current.style.left = `${mx}px`; xhairRingRef.current.style.top = `${my}px`; }
      if (xhairDotRef.current) { xhairDotRef.current.style.left = `${mx}px`; xhairDotRef.current.style.top = `${my}px`; }
      if (gunWrapRef.current) {
        gunWrapRef.current.style.left = `${pivot.x - BARREL_TIP_X}px`;
        gunWrapRef.current.style.top = `${pivot.y - BARREL_TIP_Y}px`;
        gunWrapRef.current.style.transformOrigin = `${BARREL_TIP_X}px ${BARREL_TIP_Y}px`;
        gunWrapRef.current.style.transform = `rotate(${angle}deg)`;
      }

      if (!showFeedbackRef.current) {
        let hit = null;
        btnRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom) hit = i;
        });
        if (hit !== aimedIdxRef.current) { aimedIdxRef.current = hit; setAimedIdx(hit); }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onMove = e => { mousePosRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* ── SHOOT ── */
  useEffect(() => {
    const onDown = () => {
      if (showFeedbackRef.current) return;

      const pivot = { x: window.innerWidth / 2, y: window.innerHeight - 70 };
      const rawAngle = Math.atan2(mousePosRef.current.y - pivot.y, mousePosRef.current.x - pivot.x) * (180 / Math.PI);
      const angle = Math.max(-75, Math.min(5, rawAngle));
      const rad = angle * Math.PI / 180;
      setFlashPos({ x: pivot.x + Math.cos(rad) * 90, y: pivot.y + Math.sin(rad) * 90 });
      setTimeout(() => setFlashPos(null), 220);

      const idx = aimedIdxRef.current;
      if (idx !== null && currentWordRef.current) {
        const elapsed = Date.now() - questionStartTimeRef.current;
        reactionTimesRef.current = [...reactionTimesRef.current, elapsed];
        console.log(`🕐 [REACTION] Word "${currentWordRef.current.word}" answered in ${elapsed}ms`);

        const opt = currentWordRef.current.options[idx];
        const correct = opt === currentWordRef.current.word;
        console.log(`🎯 [ANSWER] word="${currentWordRef.current.word}" selected="${opt}" correct=${correct}`);

        setBangIdx(idx);
        setTimeout(() => setBangIdx(null), 650);
        setSelectedOption(opt);
        setIsCorrect(correct);
        setShowFeedback(true);
        setGameResults(prev => {
          const next = [...prev, { word: currentWordRef.current.word, selected: opt, correct, level: currentWordRef.current.level }];
          gameResultsRef.current = next;
          console.log(`📊 [RESULTS SO FAR]`, next);
          return next;
        });
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  /* ══════════════════════════════════════════════════════
     SAVE TO SUPABASE — detailed logs at every step
  ══════════════════════════════════════════════════════ */
  const saveAllToSupabase = async (r, mlResult) => {
    console.log("\n╔══════════════════════════════════╗");
    console.log("║   SUPABASE SAVE — START          ║");
    console.log("╚══════════════════════════════════╝");
    console.log("📋 [SAVE] childData:", childData);
    console.log("📋 [SAVE] game results (r):", r);
    console.log("📋 [SAVE] mlResult:", mlResult);

    const cId = childData?.id;
    if (!cId) {
      console.error("❌ [SAVE] ABORTED — childData.id is missing! childData =", childData);
      return;
    }
    console.log("🔑 [SAVE] child UUID:", cId);
    // ── STEP 0: ensure level 1 exists in levels table ──
    console.log("\n── STEP 0: levels table ──");
    const { error: levelErr } = await supabase
      .from("levels")
      .upsert(
        { id: 1, mirror_difficulty: "easy", sound_difficulty: "easy", memory_card_count: 4 },
        { onConflict: "id" } // if row already exists, do nothing
      );

    if (levelErr) {
      console.error("❌ [levels] FAILED:", levelErr.message);
      return; // can't continue without this
    }
    console.log("✅ [levels] row 1 ready");
    // ── Derived stats ────────────────────────────────────
    const totalQuestions = r.length;
    const correctAnswers = r.filter(x => x.correct).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = parseFloat((correctAnswers / totalQuestions).toFixed(4));

    const weights = { easy: 1, moderate: 1.5, hard: 2 };
    const weightedCorrect = r.reduce((sum, x) => sum + (x.correct ? weights[x.level] : 0), 0);
    const weightedTotal = r.reduce((sum, x) => sum + weights[x.level], 0);
    const overallScore = parseFloat(((weightedCorrect / weightedTotal) * 100).toFixed(2));
    const phonologicalScore = parseFloat((accuracy * 100).toFixed(2));

    const times = reactionTimesRef.current;
    const avgReactionTime = times.length > 0
      ? parseFloat((times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(3))
      : null;

    const riskMap = { low: "Mild", medium: "Moderate", high: "Severe" };
    const rl = mlResult?.risk_level?.toLowerCase() ?? "";
    const predictedLevel = rl.includes("high") ? "Severe" : rl.includes("moderate") ? "Moderate" : "Mild";

    console.log("📐 [STATS] totalQuestions:", totalQuestions);
    console.log("📐 [STATS] correctAnswers:", correctAnswers, "| wrongAnswers:", wrongAnswers);
    console.log("📐 [STATS] accuracy:", accuracy, "| overallScore:", overallScore);
    console.log("📐 [STATS] phonologicalScore:", phonologicalScore);
    console.log("📐 [STATS] avgReactionTime (s):", avgReactionTime);
    console.log("📐 [STATS] predictedLevel:", predictedLevel, "(from risk_level:", mlResult?.risk_level, ")");

    // ── STEP 1: game_sessions ────────────────────────────
    console.log("\n── STEP 1: game_sessions ──");
    const gameSessionPayload = {
      child_id: cId,
      level_played: 1,
      overall_score: overallScore,
      avg_response_time: avgReactionTime,
    };
    console.log("📤 [game_sessions] inserting:", gameSessionPayload);

    const { data: sessionData, error: sessionErr } = await supabase
      .from("game_sessions")
      .insert(gameSessionPayload)
      .select("id")
      .single();

    if (sessionErr) {
      console.error("❌ [game_sessions] FAILED");
      console.error("   code:", sessionErr.code);
      console.error("   message:", sessionErr.message);
      console.error("   details:", sessionErr.details);
      console.error("   hint:", sessionErr.hint);
      console.error("   full error:", sessionErr);
      return; // stop — downstream tables need session_id
    }
    const sessionId = sessionData.id;
    console.log("✅ [game_sessions] saved! session_id:", sessionId);

    // ── STEP 2: game_attempts ────────────────────────────
    console.log("\n── STEP 2: game_attempts ──");
    const gameAttemptPayload = {
      session_id: sessionId,
      game_type: "sound",
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      wrong_answers: wrongAnswers,
      accuracy: accuracy,
      avg_response_time: avgReactionTime,
    };
    console.log("📤 [game_attempts] inserting:", gameAttemptPayload);

    const { error: attemptErr } = await supabase
      .from("game_attempts")
      .insert(gameAttemptPayload);

    if (attemptErr) {
      console.error("❌ [game_attempts] FAILED");
      console.error("   code:", attemptErr.code);
      console.error("   message:", attemptErr.message);
      console.error("   details:", attemptErr.details);
      console.error("   hint:", attemptErr.hint);
      console.error("   full error:", attemptErr);
    } else {
      console.log("✅ [game_attempts] saved!");
    }

    // ── STEP 3: child_daily_scores ───────────────────────
    // console.log("\n── STEP 3: child_daily_scores ──");
    // const { data: existingDays, error: daysErr } = await supabase
    //   .from("child_daily_scores")
    //   .select("day_number")
    //   .order("day_number", { ascending: false })
    //   .limit(1);

    // if (daysErr) {
    //   console.warn("⚠️ [child_daily_scores] Failed to fetch existing days:", daysErr.message);
    // }
    // console.log("📅 [child_daily_scores] existing days query result:", existingDays);

    // const dayNumber = existingDays?.length > 0 ? existingDays[0].day_number + 1 : 1;
    // console.log("📅 [child_daily_scores] using day_number:", dayNumber);

    // const dailyScoresPayload = {
    //   child_id: cId,
    //   day_number: dayNumber,
    //   phonological_score: phonologicalScore,
    //   overall_score: overallScore,
    //   reaction_time: avgReactionTime,
    // };
    // console.log("📤 [child_daily_scores] inserting:", dailyScoresPayload);

    // const { error: scoresErr } = await supabase
    //   .from("child_daily_scores")
    //   .insert(dailyScoresPayload);

    // if (scoresErr) {
    //   console.error("❌ [child_daily_scores] FAILED");
    //   console.error("   code:", scoresErr.code);
    //   console.error("   message:", scoresErr.message);
    //   console.error("   details:", scoresErr.details);
    //   console.error("   hint:", scoresErr.hint);
    //   console.error("   full error:", scoresErr);
    // } else {
    //   console.log(`✅ [child_daily_scores] saved! day_number: ${dayNumber}`);
    // }

    // ── STEP 4: predictions ──────────────────────────────
    console.log("\n── STEP 4: predictions ──");
    const predictionsPayload = {
      child_id: cId,
      phoneme_score: phonologicalScore,
      predicted_level: predictedLevel,
      confidence_score: parseFloat(mlResult?.confidence) || null,
    };
    console.log("📤 [predictions] inserting:", predictionsPayload);

    const { error: predErr } = await supabase
      .from("predictions")
      .insert(predictionsPayload);

    if (predErr) {
      console.error("❌ [predictions] FAILED");
      console.error("   code:", predErr.code);
      console.error("   message:", predErr.message);
      console.error("   details:", predErr.details);
      console.error("   hint:", predErr.hint);
      console.error("   full error:", predErr);
    } else {
      console.log("✅ [predictions] saved!");
    }

    // ── STEP 5: child_progress ───────────────────────────
    console.log("\n── STEP 5: child_progress ──");
    const { data: existingProgress, error: progressCheckErr } = await supabase
      .from("child_progress")
      .select("id")
      .eq("child_id", cId)
      .maybeSingle();

    if (progressCheckErr) {
      console.warn("⚠️ [child_progress] Failed to check existing row:", progressCheckErr.message);
    }
    console.log("🔍 [child_progress] existing row:", existingProgress);

    if (existingProgress) {
      const updatePayload = { current_level: 1, last_score: overallScore, updated_at: new Date().toISOString() };
      console.log("📤 [child_progress] updating:", updatePayload);
      const { error: updateErr } = await supabase
        .from("child_progress")
        .update(updatePayload)
        .eq("child_id", cId);

      if (updateErr) {
        console.error("❌ [child_progress] UPDATE FAILED");
        console.error("   code:", updateErr.code);
        console.error("   message:", updateErr.message);
        console.error("   details:", updateErr.details);
        console.error("   hint:", updateErr.hint);
      } else {
        console.log("✅ [child_progress] updated!");
      }
    } else {
      const insertPayload = { child_id: cId, current_level: 1, last_score: overallScore };
      console.log("📤 [child_progress] inserting:", insertPayload);
      const { error: insertErr } = await supabase
        .from("child_progress")
        .insert(insertPayload);

      if (insertErr) {
        console.error("❌ [child_progress] INSERT FAILED");
        console.error("   code:", insertErr.code);
        console.error("   message:", insertErr.message);
        console.error("   details:", insertErr.details);
        console.error("   hint:", insertErr.hint);
      } else {
        console.log("✅ [child_progress] inserted!");
      }
    }

    console.log("\n╔══════════════════════════════════╗");
    console.log("║   SUPABASE SAVE — COMPLETE       ║");
    console.log("╚══════════════════════════════════╝\n");
  };

  /* ── ML SUBMIT ── */
  const submitToMLService = async () => {
    console.log("\n🚀 [ML] submitToMLService called");
    console.log("🔍 [ML] childData at submit time:", childData);
    console.log("🔍 [ML] gameResults at submit time:", gameResultsRef.current);

    if (!childData) {
      console.error("❌ [ML] ABORTED — childData is null");
      alert("Child data not loaded yet.");
      return;
    }

    setIsLoadingML(true);
    const r = gameResultsRef.current;
    const byLevel = (lvl, chk) => r.filter(x => x.level === lvl && (chk === undefined ? true : x.correct === chk));

    const mlData = {
      Age: childData.age || 7,
      Gender: childData.gender === "male" ? 0 : 1,
      Nativelang: childData.language === "english" ? 1 : 0,
      Otherlang: childData.language === "english" ? 0 : 1,
      Clicks1: byLevel("easy").length,
      Hits1: byLevel("easy", true).length,
      Misses1: byLevel("easy", false).length,
      Score1: byLevel("easy", true).length * 10,
      Accuracy1: byLevel("easy", true).length / (byLevel("easy").length || 1),
      Missrate1: byLevel("easy", false).length / (byLevel("easy").length || 1),
      Clicks2: byLevel("moderate").length,
      Hits2: byLevel("moderate", true).length,
      Misses2: byLevel("moderate", false).length,
      Score2: byLevel("moderate", true).length * 10,
      Accuracy2: byLevel("moderate", true).length / (byLevel("moderate").length || 1),
      Missrate2: byLevel("moderate", false).length / (byLevel("moderate").length || 1),
      Clicks3: byLevel("hard").length,
      Hits3: byLevel("hard", true).length,
      Misses3: byLevel("hard", false).length,
      Score3: byLevel("hard", true).length * 10,
      Accuracy3: byLevel("hard", true).length / (byLevel("hard").length || 1),
      Missrate3: byLevel("hard", false).length / (byLevel("hard").length || 1),
    };

    console.log("📤 [ML] sending mlData:", mlData);

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlData),
      });

      console.log("📥 [ML] response status:", res.status, res.statusText);

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ [ML] HTTP error:", res.status, errText);
        throw new Error(`${res.status}: ${errText}`);
      }

      const mlResult = await res.json();
      console.log("✅ [ML] result received:", mlResult);

      await saveAllToSupabase(r, mlResult);

      Swal.fire({
        title: "🎉 Congratulations!",
        html: `
    <b>Welcome to Level Two</b> <br/><br/>
    You have successfully completed Level One.
    Get ready for the next challenge!
  `,
        icon: "success",
        confirmButtonText: "Start Level 2"
      });


      onComplete?.(r);

    } catch (err) {
      console.error("❌ [ML] submitToMLService failed:", err);
      alert(`Failed to contact ML service: ${err.message}`);
    } finally {
      setIsLoadingML(false);
    }
  };

  /* ── NEXT WORD ── */
  const nextWord = async () => {
    aimedIdxRef.current = null;
    setAimedIdx(null);

    if (currentWordIndex < level1Words.length - 1) {
      setCurrentWordIndex(i => {
        const nextIndex = i + 1;
        setCurrentWord(level1Words[nextIndex]);
        currentWordRef.current = level1Words[nextIndex];
        console.log(`➡️ [NEXT] moving to word ${nextIndex + 1}:`, level1Words[nextIndex].word);
        return nextIndex;
      });
      setSelectedOption(null);
      setIsCorrect(null);
      setShowFeedback(false);
    } else {
      console.log("🏁 [NEXT] Last word done — triggering submit");
      await submitToMLService();
    }
  };

  if (!currentWord) {
    return <div style={{ color: "white", padding: 40, fontFamily: "Nunito, sans-serif" }}>Loading Safari...</div>;
  }

  /* ══════════ RENDER ══════════ */
  return (
    <>
      <style>{styles}</style>

      <div className="gun-layer">
        {flashPos && <div className="muzzle-flash" style={{ left: flashPos.x, top: flashPos.y }} />}
        <div ref={xhairRingRef} className="xhair-ring" style={{ left: "-100px", top: "-100px" }} />
        <div ref={xhairDotRef} className="xhair-dot" style={{ left: "-100px", top: "-100px" }} />
        <div ref={gunWrapRef} style={{ position: "absolute", left: 0, top: 0, filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.8))" }}>
          <GunSVG />
        </div>
      </div>

      <div className="safari-root">
        <span className="leaf leaf-tl">🌿</span>
        <span className="leaf leaf-tr">🌿</span>
        <span className="leaf leaf-bl">🍃</span>
        <span className="leaf leaf-br">🍃</span>
        <span className="leaf leaf-ml">🌱</span>
        <span className="leaf leaf-mr">🌱</span>

        {FIREFLIES.map(f => (
          <div key={f.id} className="firefly"
            style={{
              left: f.left, top: f.top, "--dur": f.dur, "--dly": f.dly,
              "--dx": f.dx, "--dy": f.dy, "--dx2": f.dx2, "--dy2": f.dy2
            }} />
        ))}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 className="safari-header">🦁 Sound Safari</h2>
          <span className="child-tag">🧒 {childData?.name || "Loading…"} · {childData?.age || "—"}yr</span>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#7ab860", fontSize: "0.82rem" }}>
              Word {currentWordIndex + 1} of {level1Words.length}
            </span>
            <span className={`level-badge level-${currentWord?.level}`}>{currentWord?.level}</span>
          </div>
          <div className="vine-track">
            <div className="vine-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(100,210,80,0.12)", marginBottom: 22 }} />

        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <p style={{ color: "#8dc87a", fontSize: "0.88rem", margin: "0 0 12px" }}>
            🎧 Listen — move your <strong style={{ color: "#f5e642" }}>crosshair</strong> over the correct spelling and <strong style={{ color: "#f5e642" }}>click</strong> to shoot!
          </p>
          <button className="play-btn" onClick={playWordAgain}>🔊 Play Again</button>
        </div>

        <div className="options-grid">
          {currentWord.options.map((o, i) => {
            let cls = "";
            if (showFeedback) {
              if (o === currentWord.word) cls = "correct";
              else if (o === selectedOption) cls = "wrong";
            } else if (aimedIdx === i) {
              cls = "aimed";
            }
            return (
              <button
                key={o}
                ref={el => btnRefs.current[i] = el}
                className={`option-btn ${cls}`}
                style={{ "--opt-dur": OPT_FLOATS[i].dur, "--opt-dly": OPT_FLOATS[i].dly }}
                disabled={showFeedback}
              >
                {o}
                {bangIdx === i && (
                  <span className="bang-burst">
                    {isCorrect ? "💥 BANG!" : "💨 MISS!"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="feedback-banner">
            <p style={{ fontSize: "1.8rem", margin: "0 0 12px", fontFamily: "'Fredoka One',cursive" }}>
              {isCorrect ? "🎯 Bullseye!" : "❌ Missed! Keep going!"}
            </p>
            <button className="next-btn" onClick={nextWord} disabled={isLoadingML}>
              {isLoadingML ? "🔬 Analyzing…" : isLast ? "🏁 Finish Safari" : "Next Target →"}
            </button>
          </div>
        )}

        <div style={{ height: 110 }} />
      </div>
    </>
  );
}