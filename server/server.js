const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// Request Logger
// ─────────────────────────────────────────────
app.use((req, res, next) => {
    console.log("\n==============================");
    console.log("📡 Incoming Request");
    console.log("➡️ Method:", req.method);
    console.log("➡️ URL:", req.url);
    console.log("➡️ Body:", JSON.stringify(req.body, null, 2));
    console.log("==============================\n");
    next();
});

const fs = require("fs");
const axios = require("axios");

// ─────────────────────────────────────────────
// Supabase Configuration
// ─────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("❌ Supabase credentials missing in .env file");
}

console.log("✅ Supabase URL Loaded:", SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─────────────────────────────────────────────
// Load Word Bank
// ─────────────────────────────────────────────
const wordBank = JSON.parse(fs.readFileSync("./word_bank.json"));
console.log("📚 Word bank loaded:", wordBank.length, "words");

// ─────────────────────────────────────────────
// Adaptive Game Engine
// ─────────────────────────────────────────────
function calculateAccuracy(history) {
    console.log("📊 Calculating Accuracy | History:", history);
    if (!history || history.length === 0) return 0;
    const correct = history.filter(h => h.correct).length;
    const accuracy = correct / history.length;
    console.log(`✅ Correct: ${correct} | Accuracy: ${accuracy}`);
    return accuracy;
}

function ruleBasedLevel(accuracy) {
    console.log("🧠 Rule Engine Running | Accuracy:", accuracy);
    let level;
    if (accuracy > 0.75)      level = Math.random() < 0.5 ? "hard" : "moderate";
    else if (accuracy > 0.45) level = Math.random() < 0.5 ? "moderate" : "easy";
    else                      level = "easy";
    console.log("🎯 Rule Level Selected:", level);
    return level;
}

function getWord(level) {
    console.log("📚 Selecting word for level:", level);
    const filtered = wordBank.filter(w => w.level === level);
    if (filtered.length === 0) return wordBank[0];
    const word = filtered[Math.floor(Math.random() * filtered.length)];
    console.log("✅ Selected word:", word);
    return word;
}

async function aiSelectLevel(playerState) {
    try {
        console.log("🤖 AI Engine Running");
        const prompt = `
A dyslexia spelling game is adapting difficulty.
Player accuracy: ${playerState.accuracy}
Recent answers: ${JSON.stringify(playerState.history?.slice(-3))}
Choose next difficulty: easy, moderate, or hard.
Only return the word.
`;
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "phi3",
            prompt,
            stream: false,
        });
        console.log("🤖 Raw AI Response:", response.data.response);
        const level = response.data.response.toLowerCase().match(/easy|moderate|hard/);
        return level ? level[0] : "easy";
    } catch (err) {
        console.log("⚠️ Ollama failed:", err.message);
        return ruleBasedLevel(playerState.accuracy);
    }
}

async function chooseNextLevel(playerState) {
    const useAI = Math.random() < 0.5;
    console.log("Decision Mode:", useAI ? "AI 🤖" : "RULE 📊");
    return useAI ? await aiSelectLevel(playerState) : ruleBasedLevel(playerState.accuracy);
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// 🔹 Health Check
app.get("/", (req, res) => {
    res.json({ status: "Backend running" });
});

// 🔹 Add Child
app.post("/api/add-child", async (req, res) => {
    try {
        const { parent_id, name, age, gender, language } = req.body;
        if (!parent_id) return res.status(400).json({ error: "Missing parent_id" });

        const { data, error } = await supabase
            .from("children")
            .insert([{ parent_id, name, age, gender, language, dyslexia_level: null, dyslexia_profile: null }])
            .select();

        if (error) throw error;
        if (data && data.length > 0) {
            return res.status(201).json({ success: true, child_id: data[0].id, parent_id, message: "Child added successfully" });
        }
        return res.status(400).json({ error: "Failed to add child" });
    } catch (err) {
        console.error("❌ Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 🔹 Get Children by Parent ID
app.get("/api/get-children/:parent_id", async (req, res) => {
    try {
        const { parent_id } = req.params;
        console.log("📥 /api/get-children | parent_id:", parent_id);

        const { data, error } = await supabase
            .from("children")
            .select("*")
            .eq("parent_id", parent_id);

        if (error) throw error;
        return res.status(200).json(data);
    } catch (err) {
        console.error("❌ ERROR:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 🔹 Get Daily Scores (simple)
app.get("/get-scores/:child_id", async (req, res) => {
    try {
        const { child_id } = req.params;
        const { data, error } = await supabase
            .from("child_daily_scores")
            .select("*")
            .eq("child_id", child_id)
            .order("day_number", { ascending: true });

        if (error) throw error;
        return res.json(data || []);
    } catch (err) {
        console.error("❌ ERROR fetching scores:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// 🔹 Parent Dashboard — full child data
//    GET /api/dashboard/:child_id
//    Returns everything the dashboard needs in one call
// ─────────────────────────────────────────────
app.get("/api/dashboard/:child_id", async (req, res) => {
    try {
        const { child_id } = req.params;
        console.log("\n📊 DASHBOARD FETCH for child_id:", child_id);

        // ── Run all queries in parallel ───────────────────
        const [
            childResult,
            scoresResult,
            progressResult,
            predictionsResult,
            sessionsResult,
            attemptsResult,
        ] = await Promise.all([

            // 1. Child profile
            supabase
                .from("children")
                .select("*")
                .eq("id", child_id)
                .single(),

            // 2. Day-by-day score history (for charts)
            supabase
                .from("child_daily_scores")
                .select("*")
                .eq("child_id", child_id)
                .order("day_number", { ascending: true }),

            // 3. Current progress level + last score
            supabase
                .from("child_progress")
                .select("*, levels(*)")
                .eq("child_id", child_id)
                .maybeSingle(),

            // 4. ML prediction history (newest first)
            supabase
                .from("predictions")
                .select("*")
                .eq("child_id", child_id)
                .order("created_at", { ascending: false }),

            // 5. Game session history (newest first)
            supabase
                .from("game_sessions")
                .select("*")
                .eq("child_id", child_id)
                .order("created_at", { ascending: false }),

            // 6. Game attempts linked to this child's sessions
            supabase
                .from("game_attempts")
                .select("*, game_sessions!inner(child_id)")
                .eq("game_sessions.child_id", child_id)
                .order("created_at", { ascending: false }),
        ]);

        // ── Log any partial errors (don't hard-fail) ─────
        const queryErrors = {
            child: childResult.error,
            scores: scoresResult.error,
            progress: progressResult.error,
            predictions: predictionsResult.error,
            sessions: sessionsResult.error,
            attempts: attemptsResult.error,
        };
        Object.entries(queryErrors).forEach(([key, err]) => {
            if (err) console.warn(`⚠️ [DASHBOARD] ${key} error:`, err.message);
        });

        if (childResult.error) {
            return res.status(404).json({ error: "Child not found" });
        }

        const scores   = scoresResult.data   || [];
        const attempts = attemptsResult.data  || [];
        const sessions = sessionsResult.data  || [];
        const preds    = predictionsResult.data || [];

        // ── Summary stats ─────────────────────────────────
        const latestPrediction = preds[0] ?? null;
        const recentScores     = scores.slice(-7); // last 7 days for averages

        const avg = (arr, key) => arr.length
            ? parseFloat((arr.reduce((s, r) => s + (r[key] ?? 0), 0) / arr.length).toFixed(1))
            : null;

        // Improvement trend: compare first half vs second half of score history
        let improvementTrend = "not enough data";
        if (scores.length >= 4) {
            const mid      = Math.floor(scores.length / 2);
            const firstAvg = scores.slice(0, mid).reduce((s, r) => s + (r.overall_score ?? 0), 0) / mid;
            const lastAvg  = scores.slice(mid).reduce((s, r)  => s + (r.overall_score ?? 0), 0) / (scores.length - mid);
            improvementTrend = lastAvg > firstAvg + 5 ? "improving"
                             : lastAvg < firstAvg - 5 ? "declining"
                             : "stable";
        }

        // Breakdown by game type (sound / mirror / memory)
        const gameBreakdown = attempts.reduce((acc, a) => {
            const t = a.game_type ?? "unknown";
            if (!acc[t]) acc[t] = { totalQuestions: 0, correctAnswers: 0, accuracy: 0, sessions: 0 };
            acc[t].totalQuestions  += a.total_questions  ?? 0;
            acc[t].correctAnswers  += a.correct_answers  ?? 0;
            acc[t].sessions        += 1;
            return acc;
        }, {});
        Object.keys(gameBreakdown).forEach(t => {
            const g = gameBreakdown[t];
            g.accuracy = g.totalQuestions > 0
                ? parseFloat(((g.correctAnswers / g.totalQuestions) * 100).toFixed(1))
                : 0;
        });

        // ── Build final response ──────────────────────────
        const dashboard = {

            // Child profile
            child: childResult.data,

            // Key numbers for the dashboard cards
            summary: {
                totalDaysPlayed:   scores.length,
                totalSessions:     sessions.length,
                currentLevel:      progressResult.data?.current_level  ?? null,
                lastScore:         progressResult.data?.last_score      ?? null,
                latestRiskLevel:   latestPrediction?.predicted_level    ?? "Unknown",
                latestConfidence:  latestPrediction?.confidence_score   ?? null,
                avgOverallScore:   avg(recentScores, "overall_score"),
                avgPhonological:   avg(recentScores, "phonological_score"),
                avgReactionTime:   avg(recentScores, "reaction_time"),
                improvementTrend,
            },

            // Day-by-day for line charts
            scoreHistory: scores.map(s => ({
                day:             s.day_number,
                date:            s.created_at,
                overall:         s.overall_score,
                phonological:    s.phonological_score,
                visual:          s.visual_score,
                memory:          s.memory_score,
                processingSpeed: s.processing_speed,
                reactionTime:    s.reaction_time,
            })),

            // Per game type stats (for bar charts / breakdown)
            gameBreakdown,

            // Latest ML prediction
            latestPrediction,

            // Full prediction history
            predictionHistory: preds,

            // Recent 10 sessions
            recentSessions: sessions.slice(0, 10),
        };

        console.log("✅ [DASHBOARD] Ready for:", childResult.data?.name);
        console.log("   Days played:", scores.length);
        console.log("   Sessions:", sessions.length);
        console.log("   Risk:", dashboard.summary.latestRiskLevel);
        console.log("   Trend:", improvementTrend);

        return res.status(200).json(dashboard);

    } catch (err) {
        console.error("❌ [DASHBOARD] Crash:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 🔹 Adaptive Next Question
app.post("/game/next-question", async (req, res) => {
    try {
        console.log("\n🎮 GAME ENGINE START");
        const playerState = req.body;
        playerState.accuracy = calculateAccuracy(playerState.history);
        const nextLevel  = await chooseNextLevel(playerState);
        const question   = getWord(nextLevel);
        console.log("🎮 GAME ENGINE END\n");
        return res.json({ level: nextLevel, question });
    } catch (err) {
        console.error("❌ Adaptive engine error:", err);
        return res.status(500).json({ error: "Adaptive engine failed" });
    }
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});