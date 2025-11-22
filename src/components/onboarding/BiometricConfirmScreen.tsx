import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface BiometricConfirmScreenProps {
  faceData: any;
  onNext: (confirmedData: any) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onConfirmReady?: (callback: () => void) => void;
  onSkipReady?: (callback: () => void) => void;
}

type ConfirmStep = 'name' | 'age' | 'gender' | 'ethnicity' | 'eyeColor' | 'hairColor' | 'occupation' | 'complete';

export const BiometricConfirmScreen = ({ faceData, onNext, onBack, currentStep, totalSteps, onConfirmReady, onSkipReady }: BiometricConfirmScreenProps) => {
  const [internalStep, setInternalStep] = useState<ConfirmStep>('name');
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "$ biometric_scan.complete()",
    "→ Analysis complete. Let's verify your identity...",
    ""
  ]);
  
  const [confirmedData, setConfirmedData] = useState({
    name: "",
    age: faceData.age?.toString() || "",
    gender: faceData.gender || "",
    ethnicity: faceData.ethnicity || "",
    eyeColor: faceData.eyeColor || "",
    hairColor: faceData.hairColor || "",
    occupation: faceData.occupation || ""
  });
  
  const [currentInput, setCurrentInput] = useState("");
  const [showInput, setShowInput] = useState(true);
  const { toast } = useToast();

  // Play biometric scan complete audio on mount
  useEffect(() => {
    if (!hasPlayedAudio) {
      const audio = new Audio('/audio/biometric-scan-complete.mp3');
      audio.play().catch(err => console.log('Audio play failed:', err));
      setHasPlayedAudio(true);
    }
  }, [hasPlayedAudio]);

  useEffect(() => {
    const timer = setTimeout(() => {
      addPromptForStep(internalStep);
    }, 500);
    return () => clearTimeout(timer);
  }, [internalStep]);

  const addPromptForStep = (step: ConfirmStep) => {
    let prompt = "";
    let detected = "";
    
    switch(step) {
      case 'name':
        prompt = "→ Enter your name:";
        break;
      case 'age':
        detected = `→ Detected age: ${faceData.age}`;
        prompt = "→ Confirm your age (or edit):";
        setCurrentInput(confirmedData.age);
        break;
      case 'gender':
        detected = `→ Detected gender: ${faceData.gender}`;
        prompt = "→ Confirm your gender (Male/Female/Non-binary/Prefer not to say):";
        setCurrentInput(confirmedData.gender);
        break;
      case 'ethnicity':
        detected = `→ Detected ethnicity: ${faceData.ethnicity || "Not detected"}`;
        prompt = "→ Enter your ethnicity:";
        setCurrentInput(confirmedData.ethnicity);
        break;
      case 'eyeColor':
        detected = `→ Detected eye color: ${faceData.eyeColor || "Not detected"}`;
        prompt = "→ Confirm your eye color:";
        setCurrentInput(confirmedData.eyeColor);
        break;
      case 'hairColor':
        detected = `→ Detected hair: ${faceData.hairColor || "Not detected"} ${faceData.hairStyle ? `(${faceData.hairStyle})` : ""}`;
        prompt = "→ Confirm your hair color:";
        setCurrentInput(confirmedData.hairColor);
        break;
      case 'occupation':
        detected = `→ Suggested occupation: ${faceData.occupation || "Not detected"}`;
        prompt = "→ Enter your ideal occupation:";
        setCurrentInput(confirmedData.occupation);
        break;
    }
    
    if (detected) {
      setTerminalLines(prev => [...prev, detected]);
    }
    setTimeout(() => {
      setTerminalLines(prev => [...prev, prompt]);
      setShowInput(true);
    }, detected ? 300 : 0);
  };

  const handleConfirm = useCallback(() => {
    if (!currentInput.trim() && internalStep !== 'age') {
      toast({
        title: "Input Required",
        description: "Please enter a value before continuing.",
        variant: "destructive",
      });
      return;
    }

    const value = currentInput.trim();
    setTerminalLines(prev => [...prev, `  ${value}`, "→ Confirmed.", ""]);
    setShowInput(false);
    setCurrentInput("");

    const newData = { ...confirmedData, [internalStep]: value };
    setConfirmedData(newData);

    const steps: ConfirmStep[] = ['name', 'age', 'gender', 'ethnicity', 'eyeColor', 'hairColor', 'occupation', 'complete'];
    const currentIndex = steps.indexOf(internalStep);
    
    if (currentIndex < steps.length - 1) {
      setTimeout(() => {
        setInternalStep(steps[currentIndex + 1]);
      }, 500);
    } else {
      // All fields confirmed, show completion message
      setTimeout(() => {
        setTerminalLines(prev => [...prev, "→ Identity verification complete.", "→ All information confirmed."]);
        setInternalStep('complete');
      }, 500);
    }
  }, [currentInput, internalStep, confirmedData, toast]);

  const handleComplete = useCallback((data: any) => {
    const finalData = {
      ...faceData,
      name: data.name,
      age: parseInt(data.age),
      gender: data.gender,
      ethnicity: data.ethnicity,
      eyeColor: data.eyeColor,
      hairColor: data.hairColor,
      occupation: data.occupation,
    };
    
    onNext(finalData);
  }, [faceData, onNext]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showInput) {
      handleConfirm();
    }
  };

  const handleSkip = useCallback(() => {
    // Merge current input if present
    let currentData = { ...confirmedData };
    if (showInput && currentInput.trim()) {
        currentData = { ...currentData, [internalStep]: currentInput.trim() };
    }
    
    // Ensure name is present if skipping early
    if (!currentData.name || currentData.name.trim() === "") {
        currentData.name = "User";
    }

    const finalData = {
      ...faceData,
      ...currentData,
      age: parseInt(currentData.age as string) || faceData.age, // Ensure age is number
    };
    
    onNext(finalData);
  }, [confirmedData, currentInput, showInput, internalStep, faceData, onNext]);

  // Register confirm action with hardware button
  useEffect(() => {
    if (onConfirmReady && showInput) {
      if (internalStep === 'complete') {
        onConfirmReady(() => () => handleComplete(confirmedData));
      } else {
        onConfirmReady(() => handleConfirm);
      }
    }
  }, [onConfirmReady, showInput, internalStep, confirmedData, handleConfirm, handleComplete]);

  // Register skip action with hardware button
  useEffect(() => {
    if (onSkipReady) {
      onSkipReady(() => handleSkip);
    }
  }, [onSkipReady, handleSkip]);

  return (
    <div className="h-full flex flex-col bg-transparent text-beige p-6">
      {/* Terminal Header - Fake Navigation Bar */}
      <div className="flex items-center gap-2 pb-4 border-b border-beige/30 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-beige/70">biometric_scan.complete</span>
      </div>

      <div className="flex-1 font-mono text-sm overflow-y-auto space-y-2 pt-4">
        {terminalLines.map((line, i) => (
          <p key={i} className={line.startsWith('$') ? 'text-beige/60' : line.startsWith('→') ? 'text-beige' : 'text-beige/90'}>
            {line}
          </p>
        ))}
        
        {showInput && internalStep !== 'complete' && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-beige">→</span>
            {internalStep === 'gender' ? (
              <select
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 font-mono bg-black-bg text-beige border border-beige/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-beige"
                autoFocus
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <Input
                type={internalStep === 'age' ? 'number' : 'text'}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 font-mono bg-transparent text-beige/50 border-beige/30 focus:border-beige text-beige"
                placeholder={internalStep === 'name' ? 'Your name' : ''}
                autoFocus
              />
            )}
            <span className="text-beige animate-pulse">█</span>
          </div>
        )}
      </div>

      {/* Status hint at bottom */}
      <div className="text-center text-beige/50 text-xs font-['SF_Mono',monospace] mt-4">
        {showInput && internalStep !== 'complete' && "Press Confirm below to continue"}
        {internalStep === 'complete' && "Press Confirm below to complete"}
      </div>
    </div>
  );
};
