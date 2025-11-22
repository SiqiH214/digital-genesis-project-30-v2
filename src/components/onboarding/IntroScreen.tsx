import { useEffect, useState } from "react";

interface IntroScreenProps {
  onComplete: () => void;
  onConfirmReady?: (callback: (() => void) | null) => void;
}

export const IntroScreen = ({ onComplete, onConfirmReady }: IntroScreenProps) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const textLines = [
    "> SYSTEM_INITIALIZED",
    "> ",
    "> Welcome to Pika.",
    "> ",
    "> We are building a new system,",
    "> where you have the chance to start a second life.",
    "> ",
    "> To really live.",
    "> To be more than who you are today.",
    "> ",
    "> Are you ready?"
  ];

  useEffect(() => {
    if (currentLineIndex < textLines.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, textLines[currentLineIndex]]);
        setCurrentLineIndex(prev => prev + 1);
      }, currentLineIndex === 0 ? 500 : 800); // Slower pace for dramatic effect

      return () => clearTimeout(timer);
    } else if (currentLineIndex === textLines.length) {
      // All lines displayed
      setTimeout(() => {
        setIsComplete(true);
      }, 1000);
    }
  }, [currentLineIndex]);

  // Register hardware button action
  useEffect(() => {
    if (onConfirmReady) {
      if (isComplete) {
        onConfirmReady(() => onComplete);
      } else {
        onConfirmReady(null);
      }
    }
  }, [onConfirmReady, isComplete, onComplete]);

  return (
    <div className="h-full w-full bg-transparent text-beige flex flex-col relative overflow-hidden font-['SF_Mono',monospace] justify-center p-8">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)] opacity-20" />

      {/* Glowing orb in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-radial from-beige/5 via-beige/0 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Text Content */}
      <div className="relative z-10 space-y-3 max-w-[90%] mx-auto">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`text-base leading-relaxed tracking-wide animate-fade-in ${
              line.includes("SYSTEM") || line === "> "
                ? "text-beige/40 text-sm"
                : line.includes("Welcome to Pika")
                ? "text-beige font-bold text-xl mt-2"
                : line.includes("Are you ready?")
                ? "text-beige font-bold text-lg mt-6 animate-pulse"
                : "text-beige/80"
            }`}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Bottom Hint */}
      {isComplete && (
        <div className="absolute bottom-10 left-0 right-0 text-center animate-pulse">
          <div className="text-xs text-beige/60 tracking-[0.2em] uppercase">
            [ PRESS ENTER TO BEGIN ]
          </div>
        </div>
      )}
    </div>
  );
};

