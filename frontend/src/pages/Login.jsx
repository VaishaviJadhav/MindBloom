import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase/config";
import { saveSession } from "../services/session";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { supabase } from "../services/supabaseClient";
import TargetCursor from "../components/TargetCursor";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const { data, error: fetchError } = await supabase
        .from("parents")
        .select("*")
        .eq("firebase_uid", user.uid)
        .maybeSingle();
      if (fetchError || !data) {
        setError("User not found in database.");
        return;
      }
      navigate("/games");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const { data } = await supabase
        .from("parents")
        .select("*")
        .eq("firebase_uid", user.uid)
        .maybeSingle();
      if (!data) {
        setError("No account found. Please signup first.");
        return;
      }
      saveSession({ uid: user.uid, email: user.email, provider: "google", parentId: data.id });
      navigate("/add-child");
    } catch (err) {
      console.error(err);
      setError("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Override browser autofill yellow/blue highlight */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111827 !important;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>

      <div
        ref={containerRef}
        className="cursor-neutral relative min-h-screen font-sans overflow-hidden"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, #A5D6A7, #C8E6C9 40%, #E8F5E9)`,
        }}
      >
        <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn />
        <Navbar />

        <div className="min-h-screen flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-[1100px] bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden flex"
          >

            {/* LEFT IMAGE */}
            <div className="hidden md:flex md:w-1/2 items-center justify-center bg-[#e8f5e9]">
              <img
                src="./login-forest.png"
                alt="Forest"
                className="w-full h-full object-contain"
              />
            </div>

            {/* RIGHT FORM */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-16 py-16">
              <div className="w-full max-w-md">

                <h1 className="text-4xl font-black text-[#22442E] mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-500 mb-8 text-base">
                  Continue your journey with MindBloom
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-5">

                  {/* EMAIL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#22442E]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#22442E]/20 focus:border-[#22442E] transition-all"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#22442E]">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#22442E]/20 focus:border-[#22442E] transition-all"
                    />
                  </div>

                  {/* REMEMBER / FORGOT */}
                  <div className="flex items-center justify-between text-sm pt-1">
                    <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-[#22442E] cursor-pointer"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="text-[#22442E] font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* SIGN IN */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-[#22442E] text-white text-base font-semibold shadow-md hover:bg-[#1a3322] transition disabled:opacity-50"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </motion.button>

                  {/* DIVIDER */}
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex-1 border-t border-gray-200" />
                    Or continue with
                    <div className="flex-1 border-t border-gray-200" />
                  </div>

                  {/* GOOGLE LOGIN */}
                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    disabled={loading}
                    className="w-full py-3.5 rounded-full border border-gray-200 bg-white text-gray-700 font-semibold text-base flex items-center justify-center gap-3 shadow-sm hover:border-[#22442E] hover:shadow-md transition disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"/>
                    </svg>
                    Continue with Google
                  </motion.button>

                  {/* SIGNUP LINK */}
                  <p className="text-center text-sm text-gray-500 pt-1">
                    Don't have an account?{" "}
                    <span
                      onClick={() => navigate("/signup")}
                      className="text-[#22442E] font-semibold cursor-pointer hover:underline"
                    >
                      Sign Up
                    </span>
                  </p>

                </form>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
}