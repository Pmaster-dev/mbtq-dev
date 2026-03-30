import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import PinkSyncWidget from "./components/PinkSyncWidget";
import A11yBar from "./components/A11yBar";
import Manifesto from "./components/Manifesto";
import MBTQDevGenerator from "./components/MBTQDevGenerator";
import { SignVisualSystem } from "./components/SignVisualSystem";

const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:4000");

// Floating emoji particles
const FloatingEmoji = ({ emoji, delay }: { emoji: string; delay: number }) => {
  const [position, setPosition] = useState({ x: Math.random() * 100, y: 100 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({ x: Math.random() * 100, y: Math.random() * 100 });
    }, 8000 + delay * 1000);
    return () => clearInterval(interval);
  }, [delay]);
  
  return (
    <div
      className="fixed text-4xl opacity-30 pointer-events-none transition-all duration-[8000ms] ease-in-out z-0"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}s`,
      }}
    >
      {emoji}
    </div>
  );
};

export default function App() {
  const [showManifesto, setShowManifesto] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showSignSystem, setShowSignSystem] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [theme, setTheme] = useState<'rainbow' | 'sunset' | 'ocean'>('rainbow');
  
  const themes = {
    rainbow: 'from-fuchsia-100 via-pink-100 to-blue-50',
    sunset: 'from-orange-100 via-pink-100 to-purple-100',
    ocean: 'from-cyan-100 via-blue-100 to-indigo-100',
  };

  const triggerCelebration = () => {
    setCelebration(true);
    setTimeout(() => setCelebration(false), 3000);
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[theme]} font-mbtq antialiased relative overflow-hidden transition-all duration-1000`}>
      {/* Floating emoji background */}
      <FloatingEmoji emoji="🌈" delay={0} />
      <FloatingEmoji emoji="✨" delay={2} />
      <FloatingEmoji emoji="💖" delay={4} />
      <FloatingEmoji emoji="🦄" delay={6} />
      <FloatingEmoji emoji="🎨" delay={1} />
      <FloatingEmoji emoji="🌟" delay={3} />
      <FloatingEmoji emoji="🎉" delay={5} />
      
      {/* Celebration confetti overlay */}
      {celebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 2 + 1}s`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['🎉', '🎊', '✨', '💫', '🌟'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}
      
      <header className="flex justify-between items-center p-6 bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="group">
          <h1 className="text-3xl font-bold text-fuchsia-600 tracking-tight animate-pulse hover:scale-110 transition-transform cursor-default">
            🌈 mbtq.dev
          </h1>
          <span className="block text-xs text-blue-700 font-semibold group-hover:text-fuchsia-600 transition-colors">
            Next-gen queer & deaf dev platform
          </span>
        </div>
        <div className="flex gap-3">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'rainbow' | 'sunset' | 'ocean')}
            className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 focus:outline-fuchsia-700 cursor-pointer transition-all font-bold text-sm"
            aria-label="Select color theme"
          >
            <option value="rainbow">🌈 Rainbow</option>
            <option value="sunset">🌅 Sunset</option>
            <option value="ocean">🌊 Ocean</option>
          </select>
          <button
            onClick={() => {
              setShowGenerator(s => !s);
              triggerCelebration();
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 focus:outline-purple-700 transition-all hover:scale-110 font-bold shadow-lg hover:shadow-xl"
            aria-expanded={showGenerator}
            aria-label={showGenerator ? "Return to Dashboard" : "Open Generator"}
          >
            {showGenerator ? "Dashboard 🏠" : "Generator 🚀"}
          </button>
          <button
            onClick={() => {
              setShowManifesto(s => !s);
              triggerCelebration();
            }}
            className="px-4 py-2 bg-blue-700 text-white rounded-full hover:bg-fuchsia-600 focus:outline-fuchsia-700 transition-all hover:scale-110 hover:rotate-3 font-bold shadow-lg hover:shadow-xl"
            aria-expanded={showManifesto}
            aria-label={showManifesto ? "Hide Manifesto" : "Show Manifesto"}
          >
            {showManifesto ? "Hide 👋" : "Manifesto ✨"}
          </button>
          <button
            onClick={() => {
              setShowSignSystem(s => !s);
              setShowGenerator(false);
              triggerCelebration();
            }}
            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-purple-700 text-white rounded-full hover:from-gray-800 hover:to-purple-800 focus:outline-purple-700 transition-all hover:scale-110 font-bold shadow-lg hover:shadow-xl"
            aria-expanded={showSignSystem}
            aria-label={showSignSystem ? "Return to Dashboard" : "Open Sign System"}
          >
            {showSignSystem ? "Dashboard 🏠" : "Sign System 🤟"}
          </button>
        </div>
      </header>
      {showManifesto && <Manifesto />}
      {showSignSystem ? (
        <SignVisualSystem />
      ) : showGenerator ? (
        <MBTQDevGenerator />
      ) : (
        <main className="relative mx-auto max-w-7xl pt-12 flex flex-col gap-16 min-h-[80vh]">
          <PinkSyncWidget
            socket={socket}
            id="main"
            initial={{ x: 100, y: 80, w: 420, h: 220 }}
            onCelebrate={triggerCelebration}
          />
          {/* Plug in other community widgets here (DeafAuth, GithubHTML, etc.) */}
        </main>
      )}
      <A11yBar />
      <footer className="text-center p-5 bg-white/90 backdrop-blur-sm text-fuchsia-700 font-bold hover:bg-fuchsia-50 transition-all">
        mbtq.dev · Community. Culture. Power. 💜{" "}
        <a href="https://github.com/pinkycollie/mbtq-dev" className="underline hover:text-fuchsia-600 hover:scale-110 inline-block transition-all">
          GitHub ⭐
        </a>
      </footer>
    </div>
  );
}
