import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadScreenProps {
  onNext: (photos: File[]) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onSkipReady?: (callback: () => void) => void;
  onConfirmReady?: (callback: () => void) => void;
}

export const PhotoUploadScreen = ({ onNext, onBack, currentStep, totalSteps, onSkipReady, onConfirmReady }: PhotoUploadScreenProps) => {
  const [photos, setPhotos] = useState<File[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5 - photos.length);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Handle skip action
  const handleSkip = useCallback(() => {
    onNext([]);
  }, [onNext]);

  // Handle confirm action
  const handleConfirm = useCallback(() => {
    onNext(photos);
  }, [onNext, photos]);

  // Register skip button (right yellow button) - always enabled
  useEffect(() => {
    if (onSkipReady) {
      onSkipReady(() => handleSkip);
    }
  }, [onSkipReady, handleSkip]);

  // Register confirm button (center purple button) - active when at least 1 photo
  useEffect(() => {
    if (onConfirmReady) {
      if (photos.length > 0) {
        onConfirmReady(() => handleConfirm);
      } else {
        // If no photos, clear the action (button disabled)
        onConfirmReady(() => () => {}); 
      }
    }
  }, [onConfirmReady, photos.length, handleConfirm]);

  return (
    <div className="h-full w-full bg-transparent text-beige flex flex-col p-4 sm:p-6 font-mono relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)] opacity-20" />
      
      {/* Terminal Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-beige/30 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-beige/70">identity_verification</span>
      </div>

      {/* Content */}
      <div className="flex-1 pt-6 overflow-y-auto min-h-0 pb-32 no-scrollbar">
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="text-sm text-beige">&gt; UPLOADING CORE MEMORIES</div>
            <div className="text-sm text-beige/60">
              Upload 1-5 photos that prove your identity
            </div>
            <div className="text-xs text-warning/80">
              {photos.length}/5 memories uploaded
            </div>
          </div>

          {/* Main Upload Button */}
          {photos.length < 5 && (
            <label className="relative w-full aspect-[3/2] border-2 border-dashed border-beige/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-beige/60 hover:bg-beige/5 transition-all group overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,224,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center gap-4 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-beige/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-beige/20 transition-all duration-300">
                  <Upload className="w-8 h-8 text-beige group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-1">
                  <span className="text-base text-beige font-medium tracking-wide block">
                    CLICK TO UPLOAD
                  </span>
                  <span className="text-xs text-beige/50 block font-['SF_Mono',monospace]">
                    Supports: JPG, PNG (Max 5MB)
                  </span>
                </div>
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                multiple
              />
            </label>
          )}

          {/* Photo Grid - Compact list if photos exist */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-beige/40 uppercase tracking-wider pl-1">
                &gt; Uploaded Files
              </div>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square group animate-fade-in">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Memory ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-beige/30"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => removePhoto(index)}
                        className="p-1.5 bg-destructive text-white rounded-full hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-[10px] text-white/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm truncate font-mono">
                        IMG_{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {photos.length === 5 && (
            <div className="text-center pt-2">
              <div className="text-sm text-success animate-pulse font-mono">
                &gt; Memory Limit Reached
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom hint text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center">
        <div className="text-sm text-beige/60 font-['SF_Mono',monospace]">
          {photos.length > 0 
            ? "Press Next below to confirm upload" 
            : "Upload photos or press Skip below"
          }
        </div>
      </div>
    </div>
  );
};
