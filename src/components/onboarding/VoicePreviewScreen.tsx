import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "./BackButton";
import { ConfirmButton } from "./ConfirmButton";
import { ProgressIndicator } from "./ProgressIndicator";

interface VoicePreviewScreenProps {
  voiceBlob: Blob;
  onNext: (voiceId: string) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onConfirmReady?: (callback: () => void) => void;
}

export const VoicePreviewScreen = ({ voiceBlob, onNext, onBack, currentStep, totalSteps, onConfirmReady }: VoicePreviewScreenProps) => {
  const [isCloning, setIsCloning] = useState(false);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testText, setTestText] = useState("Hello, this is a test of my cloned voice.");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Auto-clone voice on mount
  useEffect(() => {
    cloneVoice();
  }, []);

  const handleConfirm = useCallback(() => {
    if (voiceId) {
      onNext(voiceId);
    }
  }, [voiceId, onNext]);

  // Register hardware button action
  useEffect(() => {
    if (onConfirmReady) {
      if (voiceId && !isCloning) {
        onConfirmReady(() => handleConfirm);
      } else {
        onConfirmReady(() => () => {});
      }
    }
  }, [onConfirmReady, voiceId, isCloning, handleConfirm]);

  const cloneVoice = async () => {
    setIsCloning(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(voiceBlob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const audioBase64 = reader.result as string;

      const { data, error } = await supabase.functions.invoke('clone-voice', {
        body: {
          audioBase64,
          name: 'Second Life Voice',
          description: 'My cloned voice for Second Life'
        }
      });

      if (error) throw error;

      if (data?.success && data?.voiceId) {
        setVoiceId(data.voiceId);
        toast({
          title: "Voice Cloned!",
          description: "Your voice has been successfully cloned.",
        });
      } else {
        throw new Error(data?.error || 'Failed to clone voice');
      }
    } catch (error: any) {
      console.error('Error cloning voice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clone voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };

  const testVoice = async () => {
    if (!voiceId) {
      toast({
        title: "Error",
        description: "Voice ID not found. Please try cloning again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsTesting(true);
    try {
      console.log('Testing voice with ID:', voiceId);
      console.log('Test text:', testText);
      
      const { data, error } = await supabase.functions.invoke('test-voice', {
        body: {
          voiceId,
          text: testText
        }
      });

      console.log('Test voice response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success && data?.audioContent) {
        console.log('Received audio content, length:', data.audioContent.length);
        
        // Convert base64 to audio and play
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('Created audio URL:', audioUrl);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
          
          toast({
            title: "Playing Voice",
            description: "Your cloned voice is now playing.",
          });
        }
      } else {
        console.error('Invalid response:', data);
        throw new Error(data?.error || 'Failed to generate test audio');
      }
    } catch (error: any) {
      console.error('Error testing voice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to test voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="h-full w-full bg-transparent text-beige flex flex-col p-4 sm:p-6 font-mono relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)] opacity-20" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <BackButton onClick={onBack} />
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        <div className="w-6" />
      </div>

      {/* Terminal Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-beige/30 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-beige/70">voice_preview</span>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 pt-6 space-y-4 overflow-y-auto min-h-0">
        <div className="text-beige font-bold text-sm">
          &gt; VOICE CLONING COMPLETE
        </div>
        
        {isCloning && (
          <div className="space-y-2">
            <div className="text-sm text-beige/90">&gt; Processing voice sample...</div>
            <div className="text-sm text-beige/90">&gt; Analyzing vocal patterns...</div>
            <div className="text-sm text-beige/90">&gt; Creating voice profile...</div>
          </div>
        )}

        {voiceId && !isCloning && (
          <>
            <div className="text-sm text-beige/90">
              &gt; Voice ID: <span className="text-beige">{voiceId}</span>
            </div>
            
            <div className="space-y-2 pt-4">
              <div className="text-sm text-beige/90">
                &gt; Test your cloned voice:
              </div>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full bg-black-bg/50 border border-beige/30 rounded p-2 text-sm text-beige font-mono min-h-[100px] outline-none focus:border-beige"
                placeholder="Enter text to test your voice..."
              />
              
              <Button
                onClick={testVoice}
                disabled={isTesting || !testText.trim()}
                className="w-full bg-beige/20 hover:bg-beige/30 text-beige border border-beige/30 font-mono text-sm py-6"
              >
                {isTesting ? '> GENERATING...' : '> TEST VOICE'}
              </Button>
            </div>

            <audio ref={audioRef} className="hidden" />
          </>
        )}
      </div>

      {/* Bottom hint text */}
      {voiceId && !isCloning && (
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-center">
          <div className="text-sm text-beige/60 font-['SF_Mono',monospace]">
            Press Next below to continue
          </div>
        </div>
      )}
    </div>
  );
};
