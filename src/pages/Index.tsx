import { useState, useEffect, useRef } from "react";
import { PhoneFrame } from "@/components/onboarding/PhoneFrame";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { FaceScanScreen } from "@/components/onboarding/FaceScanScreen";
import { BiometricConfirmScreen } from "@/components/onboarding/BiometricConfirmScreen";
import { ConfirmLookScreen } from "@/components/onboarding/ConfirmLookScreen";
import { VoiceCollectionScreen } from "@/components/onboarding/VoiceCollectionScreen";
import { NameInputScreen } from "@/components/onboarding/NameInputScreen";
import { VoicePreviewScreen } from "@/components/onboarding/VoicePreviewScreen";
import { MemoryLinksScreen } from "@/components/onboarding/MemoryLinksScreen";
import { PhotoUploadScreen } from "@/components/onboarding/PhotoUploadScreen";
import { IdentityPreview } from "@/components/onboarding/IdentityPreview";
import { CompleteScreen } from "@/components/onboarding/CompleteScreen";
import { IntroScreen } from "@/components/onboarding/IntroScreen";
import { IdentityInterview } from "@/components/onboarding/IdentityInterview";

type OnboardingStep = "welcome" | "intro" | "interview" | "scan" | "confirm" | "confirmLook" | "voice" | "voicePreview" | "photos" | "links" | "preview" | "complete";

const Index = () => {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [faceData, setFaceData] = useState<any>(null);
  const [voiceData, setVoiceData] = useState<Blob | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);

  // Background music management
  useEffect(() => {
    const audio = new Audio('/audio/onboarding-background.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Function to start background music
  const startBackgroundMusic = () => {
    if (audioRef.current && !musicStarted) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      setMusicStarted(true);
    }
  };

  // Control music based on step
  useEffect(() => {
    if (audioRef.current && musicStarted) {
      if (step === "complete") {
        // Stop music at completion
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else if (step === "scan" || step === "voice") {
        // Pause during selfie and voice recording
        audioRef.current.pause();
      } else if (step !== "welcome") {
        // Resume music after pause
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
    }
  }, [step, musicStarted]);

  const handleInterviewComplete = (data: { name: string; occupation: string }) => {
    setProfileData({ ...profileData, ...data });
    setStep("scan");
  };

  const handleFaceScan = (data: any) => {
    setFaceData(data);
    setStep("confirm");
  };

  const handleBiometricConfirm = (confirmedData: any) => {
    setFaceData(confirmedData);
    setStep("confirmLook");
  };

  const handleLookConfirm = (imageUrl: string) => {
    setProfileData((prev: any) => ({ ...prev, generatedProfilePhoto: imageUrl }));
    setStep("voice");
  };

  const handleVoiceComplete = (voice: Blob | null) => {
    setVoiceData(voice);
    if (voice) {
      setStep("voicePreview");
    } else {
      setStep("photos");
    }
  };

  const handleVoicePreviewComplete = (clonedVoiceId: string) => {
    setVoiceId(clonedVoiceId);
    setStep("photos");
  };

  const handleNameComplete = (name: string) => {
    setProfileData({ ...profileData, name });
    setStep("photos");
  };

  const handlePhotosComplete = (photos: File[]) => {
    setProfileData({ ...profileData, photos });
    setStep("links");
  };

  const handleLinksComplete = (links: any) => {
    setProfileData({ ...profileData, ...links });
    setStep("preview");
  };

  const handleEdit = () => {
    if (canEdit) {
      setStep("voicePreview");
      setCanEdit(false);
    }
  };

  const handleConfirm = () => {
    setStep("complete");
  };

  const handleRestart = () => {
    setStep("welcome");
    setFaceData(null);
    setProfileData(null);
    setCanEdit(true);
  };

  const getStepNumber = (currentStep: OnboardingStep): number => {
    const stepMap: Record<OnboardingStep, number> = {
      welcome: 0,
      intro: 1,
      interview: 2,
      scan: 3,
      confirm: 4,
      confirmLook: 5,
      voice: 6,
      voicePreview: 7,
      photos: 8,
      links: 9,
      preview: 10,
      complete: 11,
    };
    return stepMap[currentStep];
  };

  const [triggerScanAction, setTriggerScanAction] = useState<(() => void) | null>(null);
  const [triggerVoiceAction, setTriggerVoiceAction] = useState<(() => void) | null>(null);
  const [triggerVoiceSkipAction, setTriggerVoiceSkipAction] = useState<(() => void) | null>(null);
  const [triggerConfirmAction, setTriggerConfirmAction] = useState<(() => void) | null>(null);
  const [triggerConfirmSkipAction, setTriggerConfirmSkipAction] = useState<(() => void) | null>(null);
  const [triggerConfirmLookAction, setTriggerConfirmLookAction] = useState<(() => void) | null>(null);
  const [triggerVoicePreviewAction, setTriggerVoicePreviewAction] = useState<(() => void) | null>(null);
  const [triggerPhotosConfirmAction, setTriggerPhotosConfirmAction] = useState<(() => void) | null>(null);
  const [triggerPhotosSkipAction, setTriggerPhotosSkipAction] = useState<(() => void) | null>(null);
  const [triggerLinksAction, setTriggerLinksAction] = useState<(() => void) | null>(null);
  const [welcomeStartTriggered, setWelcomeStartTriggered] = useState(false);
  const [welcomeTerminalComplete, setWelcomeTerminalComplete] = useState(false);

  const [triggerPreviewConfirmAction, setTriggerPreviewConfirmAction] = useState<(() => void) | null>(null);
  const [triggerPreviewEditAction, setTriggerPreviewEditAction] = useState<(() => void) | null>(null);
  const [triggerIntroAction, setTriggerIntroAction] = useState<(() => void) | null>(null);
  const [triggerInterviewAction, setTriggerInterviewAction] = useState<(() => void) | null>(null);

  const getMainAction = () => {
    switch(step) {
      case "welcome":
        if (!welcomeStartTriggered) {
          return { label: "Start", action: () => { 
            startBackgroundMusic(); 
            setWelcomeStartTriggered(true); 
          }, disabled: false };
        } else if (welcomeTerminalComplete) {
          return { label: "Start", action: () => { 
            setStep("intro"); 
          }, disabled: false };
        } else {
          return { label: "...", action: () => {}, disabled: true };
        }
      case "intro":
        return { label: "Begin", action: triggerIntroAction || (() => {}), disabled: !triggerIntroAction };
      case "interview":
        return { label: "Enter", action: triggerInterviewAction || (() => {}), disabled: !triggerInterviewAction };
      case "scan":
        return { label: "Capture", action: triggerScanAction || (() => {}), disabled: !triggerScanAction };
      case "confirm":
        return { label: "Next", action: triggerConfirmAction || (() => {}), disabled: !triggerConfirmAction };
      case "confirmLook":
        return { label: "Next", action: triggerConfirmLookAction || (() => {}), disabled: !triggerConfirmLookAction };
      case "voice":
        return { label: "Record", action: triggerVoiceAction || (() => {}), disabled: !triggerVoiceAction };
      case "voicePreview":
        return { label: "Next", action: triggerVoicePreviewAction || (() => {}), disabled: !triggerVoicePreviewAction };
      case "photos":
        return { label: "Next", action: triggerPhotosConfirmAction || (() => {}), disabled: !triggerPhotosConfirmAction };
      case "links":
        return { label: "Next", action: triggerLinksAction || (() => {}), disabled: !triggerLinksAction };
      case "preview":
        return { label: "Enter", action: triggerPreviewConfirmAction || (() => {}), disabled: !triggerPreviewConfirmAction };
      case "complete":
        return { label: "End", action: handleRestart, disabled: false };
      default:
        return null;
    }
  };

  const getRightButtonAction = () => {
    switch(step) {
      case "confirm":
        return triggerConfirmSkipAction || null;
      case "voice":
        return triggerVoiceSkipAction || null;
      case "photos":
        return triggerPhotosSkipAction || null;
      case "preview":
        return triggerPreviewEditAction || null;
      default:
        return null;
    }
  };
  
  const getRightButtonLabel = () => {
    switch(step) {
      case "confirm":
        return "Skip";
      case "voice":
        return "Skip";
      case "photos":
        return "Skip";
      case "preview":
        return "Edit";
      default:
        return null;
    }
  };

  const getLeftButtonAction = () => {
    switch(step) {
      case "intro":
        return () => setStep("welcome");
      case "interview":
        return () => setStep("intro");
      case "scan":
        return () => setStep("interview");
      case "confirm":
        return () => setStep("scan");
      case "confirmLook":
        return () => setStep("confirm");
      case "voice":
        return () => setStep("confirmLook");
      case "voicePreview":
        return () => setStep("voice");
      case "photos":
        return () => setStep("voicePreview");
      case "links":
        return () => setStep("photos");
      case "preview":
        return () => setStep("links");
      case "complete":
        return () => setStep("preview");
      default:
        return null;
    }
  };

  const mainAction = getMainAction();
  const rightButtonAction = getRightButtonAction();
  const rightButtonLabel = getRightButtonLabel();
  const leftButtonAction = getLeftButtonAction();

  return (
    <PhoneFrame
      onMainAction={mainAction?.action}
      mainActionLabel={mainAction?.label}
      mainActionDisabled={mainAction?.disabled}
      showLeftButton={step !== "welcome"}
      showRightButton={step !== "welcome"}
      onLeftButtonAction={leftButtonAction || undefined}
      leftButtonDisabled={!leftButtonAction}
      onRightButtonAction={rightButtonAction || undefined}
      rightButtonDisabled={!rightButtonAction}
      rightButtonLabel={rightButtonLabel || undefined}
    >
      {step === "welcome" && (
        <WelcomeScreen 
          onStartTriggered={welcomeStartTriggered}
          onTerminalComplete={() => setWelcomeTerminalComplete(true)}
        />
      )}
      {step === "intro" && (
        <IntroScreen
          onComplete={() => setStep("interview")}
          onConfirmReady={setTriggerIntroAction}
        />
      )}
      {step === "interview" && (
        <IdentityInterview
          onNext={handleInterviewComplete}
          onBack={() => setStep("intro")}
          onConfirmReady={setTriggerInterviewAction}
        />
      )}
      {step === "scan" && (
        <FaceScanScreen 
          onNext={handleFaceScan} 
          onBack={() => setStep("interview")} 
          currentStep={1} 
          totalSteps={7}
          onScanActionReady={setTriggerScanAction}
        />
      )}
      {step === "confirm" && (
        <BiometricConfirmScreen 
          faceData={faceData} 
          profileData={profileData}
          onNext={handleBiometricConfirm} 
          onBack={() => setStep("scan")} 
          currentStep={2} 
          totalSteps={7}
          onConfirmReady={setTriggerConfirmAction}
          onSkipReady={setTriggerConfirmSkipAction}
        />
      )}
      {step === "confirmLook" && <ConfirmLookScreen faceData={faceData} profileData={profileData} onNext={handleLookConfirm} onBack={() => setStep("confirm")} currentStep={3} totalSteps={7} onConfirmLookReady={setTriggerConfirmLookAction} />}
      {step === "voice" && <VoiceCollectionScreen onNext={handleVoiceComplete} onBack={() => setStep("confirmLook")} currentStep={4} totalSteps={7} onRecordActionReady={setTriggerVoiceAction} onSkipReady={setTriggerVoiceSkipAction} />}
      {step === "voicePreview" && voiceData && (
        <VoicePreviewScreen 
          voiceBlob={voiceData} 
          onNext={handleVoicePreviewComplete} 
          onBack={() => setStep("voice")}
          currentStep={5}
          totalSteps={7}
          onConfirmReady={setTriggerVoicePreviewAction}
        />
      )}
      {step === "photos" && <PhotoUploadScreen onNext={handlePhotosComplete} onBack={() => setStep("voicePreview")} currentStep={6} totalSteps={7} onSkipReady={setTriggerPhotosSkipAction} onConfirmReady={setTriggerPhotosConfirmAction} />}
      {step === "links" && <MemoryLinksScreen onNext={handleLinksComplete} onBack={() => setStep("photos")} currentStep={7} totalSteps={7} onConfirmReady={setTriggerLinksAction} />}
      {step === "preview" && (
        <IdentityPreview
          faceData={faceData}
          profileData={profileData}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
          onBack={() => setStep("links")}
          onConfirmReady={setTriggerPreviewConfirmAction}
          onEditReady={setTriggerPreviewEditAction}
        />
      )}
      {step === "complete" && <CompleteScreen onRestart={handleRestart} onBack={() => setStep("preview")} />}
    </PhoneFrame>
  );
};

export default Index;
