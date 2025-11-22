import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceCollectionScreenProps {
  onNext: (voiceData: Blob | null) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onRecordActionReady?: (action: () => void) => void;
  onSkipReady?: (action: () => void) => void;
}

export const VoiceCollectionScreen = ({ onNext, onBack, currentStep, totalSteps, onRecordActionReady, onSkipReady }: VoiceCollectionScreenProps) => {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const textToRead = "I confirm my identity. I am ready to upload.";

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleSkip = () => {
    stopCamera();
    onNext(null);
  };

  // Register hardware button actions
  useEffect(() => {
    if (onRecordActionReady) {
      if (recorded) {
        onRecordActionReady(() => handleContinue);
      } else if (recording) {
        onRecordActionReady(() => stopRecording);
      } else if (cameraReady) {
        onRecordActionReady(() => startRecording);
      } else {
        onRecordActionReady(() => () => {});
      }
    }
  }, [onRecordActionReady, recorded, recording, cameraReady]);

  useEffect(() => {
    if (onSkipReady) {
      onSkipReady(() => handleSkip);
    }
  }, [onSkipReady]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (error) {
      toast({
        title: "Camera & Microphone Access Required",
        description: "Please allow access to continue",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecorded(true);
        stream.getTracks().forEach(track => track.stop());
        
        // Automatically proceed to next step
        stopCamera();
        onNext(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);

      toast({
        title: "Recording Started",
        description: "Please read the phrase clearly",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not start audio recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      toast({
        title: "Recording Complete",
        description: "Voice sample captured successfully",
      });
    }
  };

  const handleContinue = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      stopCamera();
      onNext(audioBlob);
    }
  };

  const handleRetry = () => {
    audioChunksRef.current = [];
    setRecorded(false);
    setRecording(false);
  };

  return (
    <div className="h-full w-full bg-transparent text-beige relative overflow-hidden">
      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black-bg/40" />

      {/* Terminal Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 p-6 pb-4 border-b border-beige/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-beige/70">voice_calibration.exe</span>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pt-20">
        
        <div className="w-full space-y-4 text-center mb-8">
          <h2 className="text-2xl font-bold text-beige text-glow">
            VOCAL CALIBRATION
          </h2>
          <p className="text-sm text-beige/80">
            Read the phrase to synthesize your digital voice
          </p>
        </div>

        {/* Text Display Frame */}
        <div className="relative w-full max-w-sm">
          <div className="bg-black-bg/80 backdrop-blur-md border border-beige/30 rounded-xl p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <p className="text-xs text-beige/60 uppercase tracking-widest font-['SF_Mono',monospace]">
                Voice Print Protocol
              </p>
              <p className="text-xl sm:text-2xl font-bold text-beige leading-relaxed animate-pulse">
                "{textToRead}"
              </p>
              {recording && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-ping" />
                  <span className="text-xs text-destructive font-mono uppercase tracking-wider">Recording in progress</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="text-xs text-beige/50 font-['SF_Mono',monospace]">
            {recorded ? (
              "Processing audio data..."
            ) : recording ? (
              "Press Record below to stop"
            ) : (
              "Press Record below to initialize"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
