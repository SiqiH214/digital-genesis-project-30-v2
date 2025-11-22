import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface IdentityPreviewProps {
  faceData: any;
  profileData: any;
  onConfirm: () => void;
  onEdit: () => void;
  onBack: () => void;
  onConfirmReady?: (callback: () => void) => void;
  onEditReady?: (callback: () => void) => void;
}

export const IdentityPreview = ({ faceData, profileData, onConfirm, onEdit, onBack, onConfirmReady, onEditReady }: IdentityPreviewProps) => {
  const [processing, setProcessing] = useState(true);
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProcessing(false);
      
      // Play upload complete audio when processing is done
      const audio = new Audio("/audio/upload-complete.mp3");
      audio.volume = 0.8;
      audio.play().catch(console.error);
    }, 3000);
    
    // Load the selected AI-generated photo
    const savedPhoto = localStorage.getItem('generatedProfilePhoto');
    if (savedPhoto) {
      setGeneratedPhoto(savedPhoto);
    }
    return () => clearTimeout(timer);
  }, []);

  // Register hardware button actions
  useEffect(() => {
    if (!processing) {
      if (onConfirmReady) {
        onConfirmReady(() => onConfirm);
      }
      // We can map the "Edit" action to another button if needed, 
      // or just keep it as a fallback. For now, let's assume the main button confirms.
      // If we want the right button to be "Edit", we can use onEditReady (which would map to onSkipReady in Index.tsx)
      if (onEditReady) {
        onEditReady(() => onEdit);
      }
    }
  }, [processing, onConfirmReady, onEditReady, onConfirm, onEdit]);

  if (processing) {
    return (
      <div className="h-full w-full bg-transparent text-beige flex flex-col items-center justify-center p-8">
        <div className="space-y-8 text-center">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-beige border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-beige/50 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-beige text-glow">
              GENERATING IDENTITY
            </h3>
            <p className="text-sm text-beige/60">
              Processing consciousness matrix...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayPhoto = generatedPhoto || faceData.photo;
  const name = faceData.name || profileData.name || "Unknown";
  const age = faceData.age || "??";
  const gender = faceData.gender || "Unknown";
  const ethnicity = faceData.ethnicity || "Unknown";
  const occupation = faceData.occupation || "Unknown";

  return (
    <div className="h-full w-full bg-black-bg text-beige overflow-hidden relative font-['SF_Mono',monospace]">
      {/* Full Screen Image Background */}
      <div className="absolute inset-0 z-0">
        {displayPhoto && (
          <img 
            src={displayPhoto} 
            alt="Identity" 
            className="w-full h-full object-cover grayscale contrast-125 brightness-90"
          />
        )}
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black-bg/90" />
      </div>

      {/* Top Overlay Content */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start">
        <div className="space-y-1 text-xs text-beige/80 drop-shadow-md">
          <div>&gt;compiling identity package</div>
          <div>&gt;scan fingerprint to confirm</div>
        </div>
        
        {/* Barcode Decoration */}
        <div className="bg-[#B7F699] p-2 text-black text-[10px] font-bold tracking-widest writing-vertical-rl h-24 flex items-center justify-center border border-beige">
          ID: 8X-92-1A
        </div>
      </div>

      {/* Right Side Decoration */}
      <div className="absolute top-1/3 right-0 z-10 flex flex-col gap-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-8 h-1 bg-beige/50 backdrop-blur-sm" />
        ))}
        <div className="w-12 h-8 bg-beige/80 backdrop-blur-md mt-2" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-8 h-1 bg-beige/50 backdrop-blur-sm" />
        ))}
      </div>

      {/* Name Tag */}
      <div className="absolute bottom-[35%] left-0 z-20">
        <div className="bg-beige text-black-bg px-6 py-3 text-xl font-bold tracking-wide clip-path-polygon">
          {name}
        </div>
      </div>

      {/* Bottom Info Area */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-8 pb-12 bg-black-bg">
        <div className="flex items-end justify-between">
          {/* Left: Age */}
          <div className="text-6xl font-bold text-beige tracking-tighter">
            {age}<span className="text-2xl text-beige/60 ml-1">yo</span>
          </div>

          {/* Right: Details */}
          <div className="text-right space-y-3 text-sm text-beige/90">
            <div>{gender}</div>
            <div>{ethnicity}</div>
            <div className="max-w-[150px] leading-tight">
              {occupation}
            </div>
          </div>
        </div>

        {/* Icons Row */}
        <div className="flex gap-8 mt-6 text-beige/40">
          {/* Eye Icon */}
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          
          {/* Scissors Icon (Hair) */}
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
        </div>
        
        {/* Divider Line */}
        <div className="w-full h-px bg-beige/20 mt-6" />
      </div>
    </div>
  );
};
