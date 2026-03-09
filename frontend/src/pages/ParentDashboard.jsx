import { useEffect, useState } from "react";

/* ── Palette & tokens ────────────────────────────────────────────── */
const C = {
    deepOlive: "#3A4D2F",
    olive: "#556B2F",
    lightOlive: "#6B8E23",
    paleOlive: "#8FAF5A",
    tint: "#EEF2E6",
    tintDark: "#E2EDD0",
    bg: "#F5F4F0",
    surface: "#FAFAF7",
    border: "#D8DECE",
    muted: "#8A9180",
    text: "#2C2E28",
    textSub: "#5A5E52",
};

const s = (obj) => obj;

/* ── Global Styles ──────────────────────────────────────────────── */
const GlobalStyles = () => {
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'DM Sans', sans-serif;
                background: ${C.bg};
                color: ${C.text};
                -webkit-font-smoothing: antialiased;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);
    return null;
};

/* ── Navbar ─────────────────────────────────────────────────────── */
const Navbar = ({ childName }) => (
    <nav style={s({
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 48px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 0 rgba(58,77,47,0.06)"
    })}>
        <div style={s({ display: "flex", alignItems: "center", gap: 10 })}>
            <div style={s({
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${C.olive}, ${C.lightOlive})`,
                display: "flex", alignItems: "center", justifyContent: "center"
            })}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8 2 5 6 5 10c0 5 7 12 7 12s7-7 7-12c0-4-3-8-7-8z" fill="white" opacity=".9" />
                    <circle cx="12" cy="10" r="3" fill="white" />
                </svg>
            </div>
            <span style={s({
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20, color: C.deepOlive, letterSpacing: "-0.3px"
            })}>
                MindBloom
            </span>
        </div>
        <div style={s({ display: "flex", alignItems: "center", gap: 12 })}>
            {childName && (
                <div style={s({
                    display: "flex", alignItems: "center", gap: 8,
                    background: C.tint, borderRadius: 20, padding: "5px 14px",
                    border: `1px solid ${C.tintDark}`
                })}>
                    <div style={s({
                        width: 22, height: 22, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${C.olive}, ${C.lightOlive})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: "white", fontWeight: 600
                    })}>
                        {childName.charAt(0).toUpperCase()}
                    </div>
                    <span style={s({ fontSize: 13, color: C.olive, fontWeight: 500 })}>
                        {childName}
                    </span>
                </div>
            )}
            <span style={s({ fontSize: 13, color: C.muted })}>Parent Dashboard</span>
        </div>
    </nav>
);

/* ── Hero ───────────────────────────────────────────────────────── */
const Hero = ({ summary = {}, child = {} }) => {
    const completedDays = summary.totalDaysPlayed || 0;
    const pct = Math.min((completedDays / 7) * 100, 100);

    return (
        <div style={s({ padding: "52px 48px 40px" })}>
            <div style={s({
                display: "inline-flex", alignItems: "center", gap: 7,
                background: C.tint, borderRadius: 20, padding: "4px 12px", marginBottom: 14
            })}>
                <div style={s({ width: 6, height: 6, borderRadius: "50%", background: C.lightOlive })} />
                <span style={s({
                    fontSize: 12, color: C.olive, fontWeight: 500,
                    letterSpacing: "0.5px", textTransform: "uppercase"
                })}>
                    Active Screening
                </span>
            </div>

            <h1 style={s({
                fontFamily: "'DM Serif Display', serif",
                fontSize: 32, color: C.deepOlive, lineHeight: 1.2,
                marginBottom: 10, letterSpacing: "-0.5px", maxWidth: 520
            })}>
                {child.name ? `${child.name}'s` : "Early Learning"} Risk<br />Screening Dashboard
            </h1>

            <p style={s({ fontSize: 14, color: C.textSub, maxWidth: 460, lineHeight: 1.7, marginBottom: 24 })}>
                This tool provides an evidence-based screening overview of early learning patterns.
                Results are indicative only and do not constitute a clinical diagnosis.
            </p>

            {/* Stats row */}
            <div style={s({ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 })}>
                {[
                    { label: "Sessions Played",   value: summary.totalSessions    || 0 },
                    { label: "Current Level",      value: summary.currentLevel     || "—" },
                    { label: "Last Score",         value: summary.lastScore != null ? `${summary.lastScore}%` : "—" },
                    { label: "Avg Reaction Time",  value: summary.avgReactionTime  != null ? `${summary.avgReactionTime}s` : "—" },
                    { label: "Trend",              value: summary.improvementTrend || "—" },
                ].map(({ label, value }) => (
                    <div key={label} style={s({
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: "14px 20px", minWidth: 120
                    })}>
                        <p style={s({ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 })}>
                            {label}
                        </p>
                        <p style={s({
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: 20, color: C.deepOlive,
                            textTransform: value === "improving" ? "capitalize" : "none",
                            color: value === "improving" ? C.lightOlive : value === "declining" ? "#9A6A50" : C.deepOlive
                        })}>
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div style={s({
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: "20px 28px", maxWidth: 280
            })}>
                <div style={s({ display: "flex", justifyContent: "space-between", marginBottom: 10 })}>
                    <span style={s({ fontSize: 13, color: C.textSub })}>Screening Progress</span>
                    <span style={s({ fontSize: 13, color: C.olive, fontWeight: 600 })}>Day {completedDays} of 7</span>
                </div>
                <div style={s({ height: 8, background: C.tintDark, borderRadius: 99, overflow: "hidden" })}>
                    <div style={s({
                        width: `${pct}%`, height: "100%",
                        background: `linear-gradient(90deg, ${C.olive}, ${C.lightOlive})`,
                        borderRadius: 99, transition: "width 0.5s ease"
                    })} />
                </div>
                <p style={s({ fontSize: 12, color: C.muted, marginTop: 8 })}>
                    {Math.max(0, 7 - completedDays)} session{7 - completedDays !== 1 ? "s" : ""} remaining
                </p>
            </div>
        </div>
    );
};

/* ── Risk Arc ───────────────────────────────────────────────────── */
const RiskArc = ({ summary = {}, latestPrediction = null }) => {
    const pct        = Math.round(summary.avgOverallScore || 0);
    const riskLevel  = summary.latestRiskLevel || "Unknown";
    const confidence = summary.latestConfidence;

    const riskColor = riskLevel === "Severe"   ? "#9A6A50"
                    : riskLevel === "Moderate"  ? C.olive
                    : C.lightOlive;

    return (
        <div style={s({ padding: "0 48px 40px", display: "flex", justifyContent: "center" })}>
            <div style={s({
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 24, padding: "40px 48px",
                maxWidth: 640, width: "100%",
                boxShadow: "0 4px 24px rgba(58,77,47,0.07)"
            })}>
                <div style={s({
                    display: "flex", alignItems: "center", gap: 32,
                    flexWrap: "wrap", justifyContent: "center"
                })}>
                    {/* Donut */}
                    <div style={s({ textAlign: "center" })}>
                        <div style={s({
                            width: 140, height: 140, borderRadius: "50%",
                            background: `conic-gradient(${riskColor} ${pct * 3.6}deg, ${C.tintDark} ${pct * 3.6}deg)`,
                            display: "flex", alignItems: "center", justifyContent: "center"
                        })}>
                            <div style={s({
                                width: 110, height: 110, borderRadius: "50%",
                                background: C.surface,
                                display: "flex", alignItems: "center",
                                justifyContent: "center", flexDirection: "column"
                            })}>
                                <span style={s({
                                    fontFamily: "'DM Serif Display', serif",
                                    fontSize: 32, color: C.deepOlive, lineHeight: 1
                                })}>
                                    {pct}%
                                </span>
                                <span style={s({ fontSize: 10, color: C.muted, letterSpacing: "0.5px", marginTop: 4 })}>
                                    AVG SCORE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div style={s({ flex: 1, minWidth: 240 })}>
                        <div style={s({
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: `linear-gradient(90deg, ${C.tint}, transparent)`,
                            border: `1px solid ${C.tintDark}`,
                            borderLeft: `3px solid ${riskColor}`,
                            borderRadius: 8, padding: "6px 14px", marginBottom: 14
                        })}>
                            <span style={s({ fontSize: 12, color: C.textSub, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" })}>
                                ML Risk Level
                            </span>
                            <span style={s({ fontSize: 14, color: riskColor, fontWeight: 600 })}>
                                {riskLevel}
                            </span>
                            {confidence && (
                                <span style={s({ fontSize: 11, color: C.muted })}>
                                    · {confidence}% confidence
                                </span>
                            )}
                        </div>

                        <h2 style={s({
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: 20, color: C.deepOlive, lineHeight: 1.3, marginBottom: 10
                        })}>
                            {pct === 0
                                ? "Complete sessions to generate risk profile"
                                : "Early learning pattern analysis"
                            }
                        </h2>

                        {latestPrediction && (
                            <div style={s({
                                background: C.tint, borderRadius: 10,
                                padding: "10px 14px", marginTop: 8
                            })}>
                                <p style={s({ fontSize: 12, color: C.textSub, lineHeight: 1.7 })}>
                                    <strong>Phoneme score:</strong> {latestPrediction.phoneme_score ?? "—"}% &nbsp;·&nbsp;
                                    <strong>Last assessed:</strong> {latestPrediction.created_at
                                        ? new Date(latestPrediction.created_at).toLocaleDateString()
                                        : "—"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Skill Card ─────────────────────────────────────────────────── */
const SkillCard = ({ label, pct = 0, color }) => {
    const isImproving = pct >= 65;
    return (
        <div style={s({
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 24
        })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 })}>
                <div>
                    <p style={s({ fontSize: 11, color: C.muted, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 4 })}>
                        Skill Area
                    </p>
                    <h3 style={s({ fontSize: 15, color: C.text, fontWeight: 500 })}>{label}</h3>
                </div>
                <div style={s({
                    display: "flex", alignItems: "center", gap: 4,
                    background: isImproving ? C.tint : "#F5F0EE",
                    borderRadius: 20, padding: "4px 10px"
                })}>
                    <span style={s({ fontSize: 14, color: isImproving ? C.lightOlive : "#B08060" })}>
                        {isImproving ? "↑" : "↓"}
                    </span>
                    <span style={s({ fontSize: 12, color: isImproving ? C.olive : "#9A6A50", fontWeight: 500 })}>
                        {isImproving ? "Improving" : "Focus"}
                    </span>
                </div>
            </div>
            <div style={s({ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 })}>
                <span style={s({ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: C.deepOlive, lineHeight: 1 })}>
                    {pct || "—"}
                </span>
                {pct > 0 && <span style={s({ fontSize: 14, color: C.muted })}>/100</span>}
            </div>
            <div style={s({ height: 6, background: C.tintDark, borderRadius: 99, overflow: "hidden" })}>
                <div style={s({
                    width: `${pct}%`, height: "100%",
                    background: color || `linear-gradient(90deg, ${C.olive}, ${C.lightOlive})`,
                    borderRadius: 99, transition: "width 0.5s ease"
                })} />
            </div>
        </div>
    );
};

/* ── Skills Section ─────────────────────────────────────────────── */
const SkillsSection = ({ scoreHistory = [] }) => {
    // Use the latest day's scores
    const latest = scoreHistory[scoreHistory.length - 1];
    if (!latest) return null;

    const skills = [
        { label: "Phonological Awareness", pct: Math.round(latest.phonological || 0), color: C.olive },
        { label: "Visual Processing",      pct: Math.round(latest.visual       || 0), color: C.lightOlive },
        { label: "Working Memory",         pct: Math.round(latest.memory       || 0), color: C.olive },
        { label: "Processing Speed",       pct: Math.round(latest.processingSpeed || 0), color: C.lightOlive },
    ];

    return (
        <section style={s({ padding: "0 48px 40px" })}>
            <div style={s({ marginBottom: 24 })}>
                <h2 style={s({ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.deepOlive, marginBottom: 4 })}>
                    Skill Breakdown
                </h2>
                <p style={s({ fontSize: 13, color: C.muted })}>Performance across core cognitive domains · Latest session</p>
            </div>
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 })}>
                {skills.map(sk => <SkillCard key={sk.label} {...sk} />)}
            </div>
        </section>
    );
};

/* ── Score History Chart (simple bars) ──────────────────────────── */
const ScoreChart = ({ scoreHistory = [] }) => {
    if (scoreHistory.length === 0) return null;

    return (
        <section style={s({ padding: "0 48px 40px" })}>
            <div style={s({ marginBottom: 20 })}>
                <h2 style={s({ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.deepOlive, marginBottom: 4 })}>
                    Score History
                </h2>
                <p style={s({ fontSize: 13, color: C.muted })}>Overall score per session</p>
            </div>

            <div style={s({
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 16, padding: "24px 28px"
            })}>
                <div style={s({ display: "flex", alignItems: "flex-end", gap: 10, height: 120 })}>
                    {scoreHistory.map((s_, i) => {
                        const h = Math.max(4, ((s_.overall || 0) / 100) * 120);
                        return (
                            <div key={i} style={s({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 })}>
                                <span style={s({ fontSize: 10, color: C.muted })}>{Math.round(s_.overall || 0)}%</span>
                                <div style={s({
                                    width: "100%", height: h,
                                    background: `linear-gradient(180deg, ${C.lightOlive}, ${C.olive})`,
                                    borderRadius: "4px 4px 0 0",
                                    transition: "height 0.4s ease"
                                })} />
                                <span style={s({ fontSize: 10, color: C.muted })}>D{s_.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

/* ── Day Bar ────────────────────────────────────────────────────── */
const DayBar = ({ scoreHistory = [] }) => {
    const completedDays = scoreHistory.length;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <section style={s({ padding: "0 48px 40px" })}>
            <div style={s({ marginBottom: 20 })}>
                <h2 style={s({ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.deepOlive, marginBottom: 4 })}>
                    7-Day Screening Track
                </h2>
                <p style={s({ fontSize: 13, color: C.muted })}>
                    {completedDays} session{completedDays !== 1 ? "s" : ""} completed · {Math.max(0, 7 - completedDays)} remaining
                </p>
            </div>
            <div style={s({ display: "flex", gap: 12, flexWrap: "wrap" })}>
                {days.map((day, i) => {
                    const isDone  = i < completedDays;
                    const dayData = scoreHistory[i];
                    return (
                        <div key={i} style={s({
                            flex: 1, minWidth: 72, maxWidth: 100,
                            background: isDone
                                ? `linear-gradient(135deg, ${C.olive}, ${C.lightOlive})`
                                : C.surface,
                            border: `1px solid ${isDone ? "transparent" : C.border}`,
                            padding: "18px 12px", textAlign: "center", borderRadius: 10
                        })}>
                            <p style={s({
                                fontSize: 11, fontWeight: 500, letterSpacing: "0.7px",
                                textTransform: "uppercase", marginBottom: 8,
                                color: isDone ? "rgba(255,255,255,0.7)" : C.muted
                            })}>
                                {day}
                            </p>
                            {isDone ? (
                                <>
                                    <div style={s({
                                        width: 28, height: 28, borderRadius: "50%",
                                        background: "rgba(255,255,255,0.25)",
                                        margin: "0 auto", display: "flex",
                                        alignItems: "center", justifyContent: "center"
                                    })}>
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                            <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    {dayData && (
                                        <p style={s({ fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 6 })}>
                                            {Math.round(dayData.overall || 0)}%
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div style={s({
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: C.tint, margin: "0 auto",
                                    border: `1px dashed ${C.border}`
                                })} />
                            )}
                            <p style={s({ fontSize: 11, marginTop: 8, color: isDone ? "rgba(255,255,255,0.85)" : C.muted })}>
                                Day {i + 1}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

/* ── Game Breakdown ─────────────────────────────────────────────── */
const GameBreakdown = ({ gameBreakdown = {} }) => {
    const entries = Object.entries(gameBreakdown);
    if (entries.length === 0) return null;

    const icons = { sound: "🎯", mirror: "🪞", memory: "🧠" };

    return (
        <section style={s({ padding: "0 48px 40px" })}>
            <div style={s({ marginBottom: 20 })}>
                <h2 style={s({ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.deepOlive, marginBottom: 4 })}>
                    Game Breakdown
                </h2>
                <p style={s({ fontSize: 13, color: C.muted })}>Performance per game type</p>
            </div>
            <div style={s({ display: "flex", gap: 16, flexWrap: "wrap" })}>
                {entries.map(([type, stats]) => (
                    <div key={type} style={s({
                        flex: 1, minWidth: 160,
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 16, padding: "20px 24px"
                    })}>
                        <div style={s({ fontSize: 28, marginBottom: 8 })}>{icons[type] || "🎮"}</div>
                        <p style={s({ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 })}>
                            {type} game
                        </p>
                        <p style={s({ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.deepOlive })}>
                            {stats.accuracy}%
                        </p>
                        <p style={s({ fontSize: 12, color: C.muted, marginTop: 4 })}>
                            {stats.correctAnswers}/{stats.totalQuestions} correct · {stats.sessions} session{stats.sessions !== 1 ? "s" : ""}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

/* ══════════════════════════════════════════════════════
   MAIN EXPORT — fetches its own data from /api/dashboard
══════════════════════════════════════════════════════ */
export default function ParentDashboard() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const child_id = localStorage.getItem("current_child_id");
        console.log("📊 [DASHBOARD] child_id from localStorage:", child_id);

        if (!child_id) {
            setError("No child selected. Please go back and select a child.");
            setLoading(false);
            return;
        }

        fetch(`http://localhost:8000/api/dashboard/${child_id}`)
            .then(res => {
                if (!res.ok) throw new Error(`Server responded ${res.status}`);
                return res.json();
            })
            .then(json => {
                console.log("✅ [DASHBOARD] data received:", json);
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("❌ [DASHBOARD] fetch failed:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // ── Loading ───────────────────────────────────────
    if (loading) {
        return (
            <div style={s({
                minHeight: "100vh", background: C.bg,
                display: "flex", alignItems: "center", justifyContent: "center"
            })}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={s({ textAlign: "center", padding: 40 })}>
                    <div style={s({
                        width: 48, height: 48,
                        border: `3px solid ${C.tintDark}`,
                        borderTop: `3px solid ${C.olive}`,
                        borderRadius: "50%", margin: "0 auto 16px",
                        animation: "spin 0.8s linear infinite"
                    })} />
                    <p style={s({ fontSize: 14, color: C.muted })}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────
    if (error) {
        return (
            <div style={s({
                minHeight: "100vh", background: C.bg,
                display: "flex", alignItems: "center", justifyContent: "center"
            })}>
                <div style={s({
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 16, padding: "32px 40px", textAlign: "center", maxWidth: 400
                })}>
                    <p style={s({ fontSize: 32, marginBottom: 12 })}>⚠️</p>
                    <h2 style={s({ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: C.deepOlive, marginBottom: 8 })}>
                        Could not load dashboard
                    </h2>
                    <p style={s({ fontSize: 14, color: C.muted })}>{error}</p>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────
    const { child, summary, scoreHistory, gameBreakdown, latestPrediction } = data;

    return (
        <>
            <GlobalStyles />
            <div style={s({ minHeight: "100vh", background: C.bg })}>
                <Navbar childName={child?.name} />
                <main style={s({ maxWidth: 1160, margin: "0 auto" })}>
                    <Hero     summary={summary}      child={child} />
                    <RiskArc  summary={summary}      latestPrediction={latestPrediction} />
                    <SkillsSection scoreHistory={scoreHistory} />
                    <ScoreChart    scoreHistory={scoreHistory} />
                    <GameBreakdown gameBreakdown={gameBreakdown} />
                    <DayBar        scoreHistory={scoreHistory} />
                </main>
            </div>
        </>
    );
}