const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log("\n==============================");
    console.log("📡 Incoming Request");
    console.log("➡️ Method:", req.method);
    console.log("➡️ URL:", req.url);
    console.log("➡️ Body:", JSON.stringify(req.body, null, 2));
    console.log("==============================\n");
    next();
});

const fs    = require("fs");
const axios = require("axios");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("❌ Supabase credentials missing");

console.log("✅ Supabase URL Loaded:", SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const wordBank = JSON.parse(fs.readFileSync("./word_bank.json"));
console.log("📚 Word bank loaded:", wordBank.length, "words");

// ─────────────────────────────────────────────
// Adaptive Engine Helpers
// ─────────────────────────────────────────────

function calculateAccuracy(history) {
    if (!history || history.length === 0) return 0;
    return history.filter(h => h.correct).length / history.length;
}

function ruleBasedLevel(accuracy, levelNumber = 1) {
    // Each level adds a 10% harder bias so difficulty naturally rises
    const bias            = (levelNumber - 1) * 0.1;
    const adjustedAccuracy = accuracy - bias;

    let level;
    if (adjustedAccuracy > 0.75)      level = Math.random() < 0.5 ? "hard" : "moderate";
    else if (adjustedAccuracy > 0.45) level = Math.random() < 0.5 ? "moderate" : "easy";
    else                              level = "easy";

    console.log(`🧠 Rule | acc=${accuracy.toFixed(2)} bias=${bias} adj=${adjustedAccuracy.toFixed(2)} → ${level}`);
    return level;
}

function getWord(level, usedWords = []) {
    const filtered = wordBank.filter(w => w.level === level && !usedWords.includes(w.word));
    if (filtered.length === 0) {
        // Word bank exhausted for this level — allow repeats
        const fallback = wordBank.filter(w => w.level === level);
        if (fallback.length === 0) return wordBank[0];
        return fallback[Math.floor(Math.random() * fallback.length)];
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
}

async function aiSelectLevel(accuracy, history, levelNumber) {
    try {
        const prompt = `
A dyslexia screening game is on level ${levelNumber} out of 7.
Player overall accuracy: ${(accuracy * 100).toFixed(0)}%
Recent answers: ${JSON.stringify(history?.slice(-5))}
Higher level numbers should be harder overall.
Choose next word difficulty: easy, moderate, or hard.
Only return the single word.
`;
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "phi3", prompt, stream: false,
        });
        const match = response.data.response.toLowerCase().match(/easy|moderate|hard/);
        return match ? match[0] : ruleBasedLevel(accuracy, levelNumber);
    } catch (err) {
        console.log("⚠️ Ollama unavailable:", err.message);
        return ruleBasedLevel(accuracy, levelNumber);
    }
}

async function chooseDifficulty(accuracy, history, levelNumber) {
    const useAI = Math.random() < 0.5;
    console.log("Mode:", useAI ? "AI 🤖" : "RULE 📊");
    return useAI
        ? await aiSelectLevel(accuracy, history, levelNumber)
        : ruleBasedLevel(accuracy, levelNumber);
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.get("/", (req, res) => res.json({ status: "Backend running" }));

// Add Child
app.post("/api/add-child", async (req, res) => {
    try {
        const { parent_id, name, age, gender, language } = req.body;
        if (!parent_id) return res.status(400).json({ error: "Missing parent_id" });
        const { data, error } = await supabase
            .from("children")
            .insert([{ parent_id, name, age, gender, language, dyslexia_level: null, dyslexia_profile: null }])
            .select();
        if (error) throw error;
        if (data?.length > 0) return res.status(201).json({ success: true, child_id: data[0].id, parent_id });
        return res.status(400).json({ error: "Failed to add child" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get Children by Parent ID
app.get("/api/get-children/:parent_id", async (req, res) => {
    try {
        const { parent_id } = req.params;
        const { data, error } = await supabase.from("children").select("*").eq("parent_id", parent_id);
        if (error) throw error;
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get Daily Scores
app.get("/get-scores/:child_id", async (req, res) => {
    try {
        const { child_id } = req.params;
        const { data, error } = await supabase
            .from("child_daily_scores").select("*")
            .eq("child_id", child_id).order("day_number", { ascending: true });
        if (error) throw error;
        return res.json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// 🔹 Plan Full Level
//
//    POST /game/plan-level
//
//    Body:
//    {
//      levelNumber:     2,          ← level being planned (1–7)
//      previousHistory: [           ← every answer from ALL previous levels
//        { word, correct, level },
//        ...
//      ],
//      wordCount:       5           ← words to return (default 5)
//    }
//
//    Returns:
//    {
//      levelNumber: 2,
//      accuracy:    0.6,
//      words: [ { word, options, level }, ... ]
//    }
//
//    Called ONCE before each level starts.
//    Server looks at all previous performance and plans
//    the entire word list for the upcoming level upfront.
// ─────────────────────────────────────────────
app.post("/game/plan-level", async (req, res) => {
    try {
        const {
            levelNumber     = 1,
            previousHistory = [],
            wordCount       = 5,
        } = req.body;

        console.log(`\n🎯 PLANNING LEVEL ${levelNumber}`);
        console.log(`   Previous answers: ${previousHistory.length}`);
        console.log(`   Words to plan:    ${wordCount}`);

        const accuracy = calculateAccuracy(previousHistory);
        console.log(`   Accuracy so far:  ${(accuracy * 100).toFixed(0)}%`);

        // Collect all words already used across all levels — no repeats
        const usedWords = previousHistory.map(h => h.word);

        const words = [];
        for (let i = 0; i < wordCount; i++) {
            // Difficulty decision is based on everything so far + already planned words
            const planHistory = [
                ...previousHistory,
                // treat already-planned words as "answered correctly" for difficulty calc
                ...words.map(w => ({ word: w.word, correct: true, level: w.level })),
            ];
            const runningAccuracy = calculateAccuracy(planHistory);
            const difficulty      = await chooseDifficulty(runningAccuracy, planHistory, levelNumber);
            const word            = getWord(difficulty, usedWords);

            usedWords.push(word.word);
            words.push(word);

            console.log(`   Word ${i + 1}: "${word.word}" (${difficulty})`);
        }

        console.log(`✅ Level ${levelNumber} ready: [${words.map(w => w.word).join(", ")}]\n`);

        return res.json({ levelNumber, accuracy: parseFloat(accuracy.toFixed(2)), words });

    } catch (err) {
        console.error("❌ plan-level error:", err);
        return res.status(500).json({ error: "Failed to plan level" });
    }
});

// Legacy single-question endpoint (kept for backwards compatibility)
app.post("/game/next-question", async (req, res) => {
    try {
        const playerState = req.body;
        const accuracy    = calculateAccuracy(playerState.history);
        const level       = await chooseDifficulty(accuracy, playerState.history, 1);
        const question    = getWord(level, []);
        return res.json({ level, question });
    } catch (err) {
        return res.status(500).json({ error: "Adaptive engine failed" });
    }
});

// Parent Dashboard
app.get("/api/dashboard/:child_id", async (req, res) => {
    try {
        const { child_id } = req.params;

        const [childResult, scoresResult, progressResult, predictionsResult, sessionsResult, attemptsResult] =
            await Promise.all([
                supabase.from("children").select("*").eq("id", child_id).single(),
                supabase.from("child_daily_scores").select("*").eq("child_id", child_id).order("day_number", { ascending: true }),
                supabase.from("child_progress").select("*, levels(*)").eq("child_id", child_id).maybeSingle(),
                supabase.from("predictions").select("*").eq("child_id", child_id).order("created_at", { ascending: false }),
                supabase.from("game_sessions").select("*").eq("child_id", child_id).order("created_at", { ascending: false }),
                supabase.from("game_attempts").select("*, game_sessions!inner(child_id)").eq("game_sessions.child_id", child_id).order("created_at", { ascending: false }),
            ]);

        if (childResult.error) return res.status(404).json({ error: "Child not found" });

        const scores   = scoresResult.data    || [];
        const attempts = attemptsResult.data   || [];
        const sessions = sessionsResult.data   || [];
        const preds    = predictionsResult.data || [];
        const latestPrediction = preds[0] ?? null;
        const recentScores     = scores.slice(-7);
        const avg = (arr, key) => arr.length
            ? parseFloat((arr.reduce((s, r) => s + (r[key] ?? 0), 0) / arr.length).toFixed(1)) : null;

        let improvementTrend = "not enough data";
        if (scores.length >= 4) {
            const mid  = Math.floor(scores.length / 2);
            const fAvg = scores.slice(0, mid).reduce((s, r) => s + (r.overall_score ?? 0), 0) / mid;
            const lAvg = scores.slice(mid).reduce((s, r)   => s + (r.overall_score ?? 0), 0) / (scores.length - mid);
            improvementTrend = lAvg > fAvg + 5 ? "improving" : lAvg < fAvg - 5 ? "declining" : "stable";
        }

        const gameBreakdown = attempts.reduce((acc, a) => {
            const t = a.game_type ?? "unknown";
            if (!acc[t]) acc[t] = { totalQuestions: 0, correctAnswers: 0, accuracy: 0, sessions: 0 };
            acc[t].totalQuestions += a.total_questions ?? 0;
            acc[t].correctAnswers += a.correct_answers ?? 0;
            acc[t].sessions       += 1;
            return acc;
        }, {});
        Object.keys(gameBreakdown).forEach(t => {
            const g = gameBreakdown[t];
            g.accuracy = g.totalQuestions > 0
                ? parseFloat(((g.correctAnswers / g.totalQuestions) * 100).toFixed(1)) : 0;
        });

        return res.status(200).json({
            child:   childResult.data,
            summary: {
                totalDaysPlayed: scores.length, totalSessions: sessions.length,
                currentLevel:    progressResult.data?.current_level ?? null,
                lastScore:       progressResult.data?.last_score    ?? null,
                latestRiskLevel: latestPrediction?.predicted_level  ?? "Unknown",
                latestConfidence: latestPrediction?.confidence_score ?? null,
                avgOverallScore: avg(recentScores, "overall_score"),
                avgPhonological: avg(recentScores, "phonological_score"),
                avgReactionTime: avg(recentScores, "reaction_time"),
                improvementTrend,
            },
            scoreHistory: scores.map(s => ({
                day: s.day_number, date: s.created_at, overall: s.overall_score,
                phonological: s.phonological_score, visual: s.visual_score,
                memory: s.memory_score, processingSpeed: s.processing_speed, reactionTime: s.reaction_time,
            })),
            gameBreakdown, latestPrediction, predictionHistory: preds,
            recentSessions: sessions.slice(0, 10),
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));