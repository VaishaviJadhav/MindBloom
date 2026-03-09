import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-7
                    bg-green-900/20 backdrop-blur-md border-b border-white/10">

      {/* Logo */}
      <div className="text-3xl font-black text-white tracking-tighter">
        <Link to="/">MINDBLOOM</Link>
      </div>

      {/* Links */}
      <div className="flex items-center gap-10">
        <Link
          to="/"
          className="text-white font-bold text-xl hover:text-green-300 transition-colors"
        >
          Home
        </Link>

        {/* Login Button */}
        <motion.button
          onClick={() => {
            console.log("Login button clicked!");
            navigate("/login");
          }}
          whileHover={{
            scale: 1.06,
            boxShadow: "0 0 40px rgba(34,68,46,0.9), 0 0 80px rgba(34,68,46,0.5)"
          }}
          whileTap={{ scale: 0.95 }}
          className="cursor-target px-14 py-5 rounded-xl bg-[#22442E]/80 backdrop-blur-md text-white font-black text-xl shadow-xl hover:bg-[#22442E]/90 transition"
          style={{
            boxShadow: "0 0 24px rgba(34,68,46,0.7), 0 4px 24px rgba(0,0,0,0.4)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
            letterSpacing: "0.06em",
          }}
        >
          Login
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar;