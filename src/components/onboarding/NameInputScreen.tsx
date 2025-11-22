import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NameInputScreenProps {
  onNext: (name: string) => void;
  onBack: () => void;
  onConfirmReady?: (callback: () => void) => void;
}

export const NameInputScreen = ({ onNext, onBack, onConfirmReady }: NameInputScreenProps) => {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  const terminalLines = [
    "> IDENTITY MATRIX INITIALIZATION",
    "> Establishing neural pathways...",
    "> ",
    "> Enter your name handle for Second Life",
    "> This will be your eternal identifier",
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < terminalLines.length) {
        setLines(prev => [...prev, terminalLines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowInput(true), 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorBlink(prev => !prev);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, []);

  // Register confirm action when input is valid
  useEffect(() => {
    if (showInput && input.trim() && onConfirmReady) {
      onConfirmReady(() => {
        onNext(input.trim());
      });
    }
  }, [showInput, input, onConfirmReady, onNext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onNext(input.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onNext(input.trim());
    }
  };

  return (
    <div className="h-full w-full bg-transparent text-beige flex flex-col p-4 sm:p-6 font-mono relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)] opacity-20" />
      
      <Button
        onClick={onBack}
        variant="ghost"
        className="absolute top-4 left-4 text-beige hover:text-beige/70 z-10 font-mono"
      >
        ← Back
      </Button>

      {/* Terminal Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-beige/30 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-beige/70">identity_matrix</span>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 pt-6 space-y-2 overflow-y-auto min-h-0">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`text-sm ${
              line?.includes("IDENTITY MATRIX")
                ? "text-beige font-bold"
                : "text-beige/90"
            }`}
          >
            {line || ""}
          </div>
        ))}
        
        {showInput && (
          <form onSubmit={handleSubmit} className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-beige">&gt;</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent text-beige border-none outline-none text-beige placeholder:text-beige/40"
                placeholder="Type your name..."
                autoFocus
                maxLength={50}
              />
              <span className={`text-beige ${cursorBlink ? "opacity-100" : "opacity-0"}`}>█</span>
            </div>
          </form>
        )}
      </div>

      {/* Status message at bottom */}
      {showInput && (
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-beige/50 text-xs font-['SF_Mono',monospace] animate-fade-in">
          {input.trim() ? "Press Confirm below to continue" : "Enter your name to proceed"}
        </div>
      )}
    </div>
  );
};
