import { useNavigate } from "react-router-dom";
import { motion, useAnimationControls, useInView } from "framer-motion";
import { useRef, useEffect } from "react";

import Navbar from "../components/Navbar";
import TargetCursor from "../components/TargetCursor";

const Landing = () => {
  const navigate = useNavigate();

  /* =============================
     SECTION VISIBILITY
  ============================== */
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "-150px"
  });

  const pathControls = useAnimationControls();

  useEffect(() => {
    if (isInView) {
      pathControls.start({
        pathLength: 1,
        transition: {
          duration: 4.5,
          ease: "easeInOut"
        }
      });
    }
  }, [isInView, pathControls]);

  /* =============================
     LOOP-DE-LOOP PATH DATA
  ============================== */
  const pathData = "M 0 200 C 150 200 200 50 400 150 C 600 250 850 350 900 200 C 950 50 700 50 750 200 C 800 350 1100 250 1300 150 C 1500 50 1750 200 2000 200";

  /* =============================
     LEVEL DATA (positioned along path)
  ============================== */
  const levels = [
    {
      title: "Whispering Willows",
      info: "A calm beginning that nurtures focus and awareness.",
      icon: "./icons/1.png",
      left: "20%",
      top: "48%",
      progress: 0.22,
      delay: 0.8
    },
    {
      title: "Rune Blending",
      info: "Pattern play to strengthen memory and cognition.",
      icon: "./icons/2.png",
      left: "48%",
      top: "75%",
      progress: 0.52,
      delay: 2.2
    },
    {
      title: "Rapid Bloom",
      info: "Fast-paced challenges to build agility and confidence.",
      icon: "./icons/3.png",
      left: "78%",
      top: "48%",
      progress: 0.78,
      delay: 3.6
    }
  ];

  return (
    <div className="cursor-neutral relative min-h-screen font-sans selection:bg-green-200 bg-white overflow-x-hidden">
      {/* CURSOR */}
      <TargetCursor
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />

      <Navbar />

      {/* =============================
          HERO SECTION
      ============================== */}
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: "url('./forest.png')" }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 text-white">
            MindBloom
          </h1>

          <p className="text-xl md:text-3xl text-[#9FB8A5] font-bold mb-10">
            A mystical journey awaits.
          </p>

          {/* ✅ ADD cursor-target CLASS */}
<motion.button
  whileHover={{ 
    scale: 1.06,
    boxShadow: "0 0 40px rgba(34,68,46,0.9), 0 0 80px rgba(34,68,46,0.5)"
  }}
  whileTap={{ scale: 0.95 }}
  onClick={() => navigate("/login")}
  className="
    cursor-target
    px-20 py-7 rounded-xl
    bg-[#22442E]/80
    backdrop-blur-md
    text-white font-black text-3xl tracking-wide
    transition
  "
  style={{
    boxShadow: "0 0 24px rgba(34,68,46,0.7), 0 4px 24px rgba(0,0,0,0.4)",
    border: "1.5px solid rgba(255,255,255,0.2)",
    textShadow: "0 1px 8px rgba(0,0,0,0.4)",
    letterSpacing: "0.06em",
  }}
>
  Get Started
</motion.button>
        </motion.div>
      </div>

      {/* =============================
          LOOP-DE-LOOP PATH SECTION
      ============================== */}
      <section ref={sectionRef} className="relative py-60 bg-emerald-50 overflow-hidden">
        {/* SVG PATH + DECORATIONS */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none">
          <svg width="100%" height="600" viewBox="0 0 2000 400" fill="none" className="overflow-visible">
            {/* BASE PATH */}
            <path
              d={pathData}
              stroke="#BFB5A8"
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* ANIMATED PATH */}
            <motion.path
              d={pathData}
              stroke="#D8CFC4"
              strokeWidth="50"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={pathControls}
            />

            {/* DECORATIVE TREES */}
            <g opacity="0.7">
              <circle cx="300" cy="80" r="22" fill="#5F7C67" />
              <circle cx="330" cy="100" r="18" fill="#5F7C67" />
              <rect x="315" y="110" width="6" height="18" rx="3" fill="#4A5F50" />
            </g>

            <g opacity="0.7">
              <circle cx="650" cy="320" r="25" fill="#5F7C67" />
              <circle cx="680" cy="340" r="20" fill="#5F7C67" />
              <rect x="665" y="350" width="6" height="22" rx="3" fill="#4A5F50" />
            </g>

            <g opacity="0.7">
              <circle cx="1200" cy="80" r="22" fill="#5F7C67" />
              <circle cx="1230" cy="100" r="18" fill="#5F7C67" />
              <rect x="1215" y="110" width="6" height="18" rx="3" fill="#4A5F50" />
            </g>

            <g opacity="0.7">
              <circle cx="1700" cy="120" r="24" fill="#5F7C67" />
              <circle cx="1730" cy="140" r="18" fill="#5F7C67" />
              <rect x="1715" y="150" width="6" height="20" rx="3" fill="#4A5F50" />
            </g>

            {/* DECORATIVE STONES */}
            <ellipse cx="500" cy="160" rx="14" ry="10" fill="#9CA3AF" />
            <ellipse cx="530" cy="175" rx="10" ry="7" fill="#9CA3AF" />

            <ellipse cx="1050" cy="270" rx="14" ry="10" fill="#9CA3AF" />
            <ellipse cx="1080" cy="285" rx="10" ry="7" fill="#9CA3AF" />

            <ellipse cx="1500" cy="160" rx="14" ry="10" fill="#9CA3AF" />
            <ellipse cx="1530" cy="175" rx="10" ry="7" fill="#9CA3AF" />
          </svg>
        </div>

        {/* =============================
            ANIMATED TEXT CARDS (appear as path reaches them)
        ============================== */}
        <div className="relative z-10 max-w-7xl mx-auto h-[500px]">
          {levels.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{
                delay: point.delay,
                duration: 0.6,
                ease: "easeOut"
              }}
              className="absolute flex flex-col items-center"
              style={{ left: point.left, top: point.top }}
            >
              <div className="
                bg-white/90 backdrop-blur-md
                border border-[#D8CFC4]
                rounded-2xl px-6 py-4
                shadow-lg
                flex flex-col items-center gap-2
              ">
                {/* ICON IMAGE */}
                <img
                  src={point.icon}
                  alt={point.title}
                  className="w-24 h-24 object-contain rounded-xl"
                  draggable={false}
                />

                {/* TITLE */}
                <h3 className="text-[#22442E] font-black text-lg text-center">
                  {point.title}
                </h3>
              </div>

              {/* INFO CARD */}
              <div className="
                mt-3 max-w-[220px]
                bg-[#F6F2ED]/90 backdrop-blur-md
                border border-[#D8CFC4]
                rounded-xl px-4 py-3
                shadow-md text-center
              ">
                <p className="text-sm text-[#4A5F50] leading-snug">
                  {point.info}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =============================
          ABOUT US
      ============================== */}
      <section className="bg-white py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            About Us
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            MindBloom is designed to nurture cognitive growth through calm, progressive learning journeys. We combine science-backed methods with engaging, game-like experiences to help minds flourish naturally—without pressure.
          </p>
        </div>
      </section>

      {/* =============================
          FOOTER
      ============================== */}
      <footer className="bg-emerald-900 text-emerald-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold">© 2026 MindBloom</span>
          <div className="flex gap-6 text-sm">
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="hover:underline cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;