import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MemoryLinksScreenProps {
  onNext: (links: { instagram: string; twitter: string; email: string }) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onConfirmReady?: (callback: () => void) => void;
}

export const MemoryLinksScreen = ({ onNext, onBack, currentStep, totalSteps, onConfirmReady }: MemoryLinksScreenProps) => {
  const [formData, setFormData] = useState({
    instagram: "",
    twitter: "",
    email: "",
  });

  const handleSubmit = useCallback(() => {
    onNext(formData);
  }, [onNext, formData]);

  // Register hardware button action
  useEffect(() => {
    if (onConfirmReady) {
      onConfirmReady(() => handleSubmit);
    }
  }, [onConfirmReady, handleSubmit]);

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
        <span className="text-xs text-beige/70">memory_links</span>
      </div>

      {/* Content */}
      <div className="flex-1 pt-6 overflow-y-auto min-h-0 pb-32">
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <div className="text-sm text-beige">&gt; CONNECTING MEMORY STREAMS</div>
            <div className="text-sm text-beige/60">Link your digital footprints (optional)</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-xs text-beige uppercase tracking-wider">
                Instagram Handle
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-beige text-sm">&gt;</span>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="bg-black-bg border-beige/50 focus:border-beige text-beige font-mono"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-xs text-beige uppercase tracking-wider">
                Twitter Handle
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-beige text-sm">&gt;</span>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="bg-black-bg border-beige/50 focus:border-beige text-beige font-mono"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-beige uppercase tracking-wider">
                Email Address
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-beige text-sm">&gt;</span>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-black-bg border-beige/50 focus:border-beige text-beige font-mono"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom hint text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center">
        <div className="text-sm text-beige/60 font-['SF_Mono',monospace]">
          Press Next below to continue
        </div>
      </div>
    </div>
  );
};
