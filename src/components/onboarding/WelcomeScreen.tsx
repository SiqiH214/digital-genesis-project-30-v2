import { useState, useEffect, useMemo } from "react";

interface WelcomeScreenProps {
  onStartTriggered?: boolean;
  onTerminalComplete?: () => void;
}

export const WelcomeScreen = ({ onStartTriggered, onTerminalComplete }: WelcomeScreenProps) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoadingText, setShowLoadingText] = useState(false);
  const [started, setStarted] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);
  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);

  const terminalLines = useMemo(() => [
    "> Hello, Welcome to Pika",
    "> ",
    "> Hello, Welcome to Pika",
    "> You're about to upload your consciousness.",
    "> And begin a second life.",
    "> ",
    "> You can bring your existing self.",
    "> Or create a new identity from scratch.",
    "> This choice defines who you will become.",
    "> ",
    "> Proceed when ready.",
  ], []);

  // Loading animation on start screen (before pressing Start)
  useEffect(() => {
    if (!started) {
      setShowLoadingText(true);
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      return () => clearInterval(progressInterval);
    }
  }, [started]);

  // Terminal animation after pressing Start
  useEffect(() => {
    if (!onStartTriggered || started) {
      return;
    }

    setStarted(true);

    // Keyboard sound - play immediately and loop continuously
    const keyboardSound = new Audio("/audio/typing-sound.mp3");
    keyboardSound.volume = 0.3;
    keyboardSound.loop = true;
    keyboardSound.play().catch((err) => console.log("Keyboard sound failed:", err));

    // Voice-over - play once after 1 second
    const voiceOver = new Audio("/audio/welcome-to-pika.mp3");
    voiceOver.volume = 0.8;

    let voiceOverTimeout: number;
    if (!hasPlayedVoice) {
      voiceOverTimeout = window.setTimeout(() => {
        voiceOver
          .play()
          .then(() => {
            console.log("Voice-over started playing");
            setHasPlayedVoice(true);
          })
          .catch((err) => console.error("Voice-over playback failed:", err));
      }, 1000);
    }

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < terminalLines.length) {
        setLines((prev) => [...prev, terminalLines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        keyboardSound.pause();
        setTimeout(() => {
          setShowPrompt(true);
          onTerminalComplete?.();
        }, 500);
      }
    }, 800);

    return () => {
      clearInterval(interval);
      clearTimeout(voiceOverTimeout);
      keyboardSound.pause();
      voiceOver.pause();
    };
  }, [onStartTriggered, terminalLines, onTerminalComplete]);

  // Cursor blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorBlink((prev) => !prev);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col font-['SF_Mono',monospace] relative overflow-hidden bg-transparent text-beige">
      {!started ? (
        /* Initial Screen - Logo and Loading Text */
        <div className="h-full w-full flex flex-col py-8 animate-fade-in">
          {/* Terminal Header - Fake Navigation Bar */}
          <div className="flex items-center gap-2 px-6 pb-4 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full bg-warning/70" />
              <div className="w-3 h-3 rounded-full bg-success/70" />
            </div>
            <span className="text-xs text-beige/70">upload.exe</span>
          </div>

          {/* Center Content - Computer Icon */}
          <div className="flex-1 flex flex-col items-center justify-center relative px-8">
            {/* Computer Icon - centered */}
            <div className="flex flex-col items-center mb-auto mt-20">
              {/* Computer Icon Image */}
              <img 
                src="/images/computer.png"
                alt="Computer"
                className="w-[90px] h-[94px]"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  // Fallback to SVG if PNG not found
                  e.currentTarget.src = '/images/computer.svg';
                }}
              />
            </div>

            {/* Loading Text & Bar - Bottom of screen */}
            {showLoadingText && (
              <div className="w-full pl-[2px] pr-6 pb-6 font-['SF_Mono',monospace] text-sm leading-relaxed animate-fade-in text-beige/90 space-y-2">
                <div className="opacity-0 animate-[fade-in_0.3s_ease-out_0.2s_forwards]">
                  &gt;connecting to P1k4
                </div>
                <div className="opacity-0 animate-[fade-in_0.3s_ease-out_0.6s_forwards]">
                  &gt;loading consciousness_upload.exe
                </div>

                {/* Retro Progress Bar */}
                <div className="opacity-0 animate-[fade-in_0.3s_ease-out_1s_forwards] flex items-center gap-3">
                  <div className="flex-1 h-4 bg-beige/10 border border-beige/30 p-[2px]">
                    <div
                      className="h-full bg-beige/80 transition-all duration-300"
                      style={{
                        width: `${loadingProgress}%`,
                        backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                        backgroundSize: '4px 4px'
                      }}
                    />
                  </div>
                  <span className="text-sm text-beige/90 w-10 text-right font-bold">{loadingProgress}</span>
                </div>

                <div className="mt-2 opacity-0 animate-[fade-in_0.3s_ease-out_1.5s_forwards] text-beige/70">
                  &gt; establishing neural connection_
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Terminal Text Screen - After Start is pressed */
        <div className="h-full w-full flex flex-col pt-4">
          {/* Terminal Header - Fake Navigation Bar */}
          <div className="flex items-center gap-2 px-6 pb-4 border-b border-beige/30 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full bg-warning/70" />
              <div className="w-3 h-3 rounded-full bg-success/70" />
            </div>
            <span className="text-xs text-beige/70">welcome.com</span>
          </div>

          {/* Terminal Content */}
          <div className="flex-1 px-6 pt-8 space-y-3 overflow-y-auto min-h-0 pb-32 font-['SF_Mono',monospace]">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`text-sm leading-relaxed transition-all duration-300 ${
                  line?.includes("upload your consciousness") ||
                  line?.includes("begin a second life")
                    ? "text-[#FF6B6B] font-medium pl-2 border-l-2 border-[#FF6B6B]/50"
                    : line?.includes("Proceed when ready")
                      ? "text-[#B7F699] font-medium animate-pulse"
                      : line?.includes("WARNING") || line?.includes("⚠")
                        ? "text-[#FFD93D] font-medium"
                        : line?.includes("Welcome to Pika")
                          ? "text-beige font-bold text-base"
                          : line === "> "
                            ? "text-beige/40"
                            : "text-beige/80"
                }`}
              >
                {line || ""}
              </div>
            ))}
            {lines.length === terminalLines.length && (
              <div className="text-sm text-beige/90 flex items-center gap-1 pt-2">
                <span>&gt;</span>
                <span className={`inline-block w-2 h-4 bg-beige/80 ${cursorBlink ? "opacity-100" : "opacity-0"} transition-opacity`} />
              </div>
            )}
          </div>

          {/* Bottom Prompt - Show when terminal complete */}
          {showPrompt && (
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 bg-gradient-to-t from-black-bg via-black-bg/80 to-transparent animate-fade-in">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-beige/20 to-transparent mb-4" />
              <div className="text-center text-beige/50 text-xs font-['SF_Mono',monospace] tracking-wider">
                SYSTEM READY • PRESS START TO CONTINUE
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
