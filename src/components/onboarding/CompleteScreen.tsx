interface CompleteScreenProps {
  onRestart: () => void;
  onBack: () => void;
}

export const CompleteScreen = ({ onRestart, onBack }: CompleteScreenProps) => {

  return (
    <div className="h-full w-full bg-transparent text-beige flex flex-col p-6 font-['SF_Mono',monospace] relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)] opacity-20" />
      
      {/* Terminal Header - Fake Navigation Bar */}
      <div className="flex items-center gap-2 pb-4 border-b border-beige/30 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-beige/70">upload.complete</span>
      </div>

      {/* Terminal content */}
      <div className="flex-1 flex flex-col relative z-10 pt-8">
        <div className="flex-1 space-y-3 text-sm overflow-y-auto animate-fade-in">
          {/* Terminal messages */}
          <p className="text-beige">&gt; Welcome to your second life.</p>
          <p className="text-beige">&gt; Your consciousness has been successfully uploaded.</p>
          <p className="text-beige">&gt; Your new identity is now active in the system.</p>
          <p className="text-beige">&gt; You are reborn.</p>
        </div>
      </div>
    </div>
  );
};
