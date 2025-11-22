import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { BackButton } from "./BackButton";
import { ConfirmButton } from "./ConfirmButton";
import { ProgressIndicator } from "./ProgressIndicator";
// import * as faceDetection from '@tensorflow-models/face-detection';
// import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
// import '@tensorflow/tfjs-core';
// import '@tensorflow/tfjs-backend-webgl';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface FaceScanScreenProps {
  onNext: (faceData: any) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onScanActionReady?: (action: () => void) => void;
}

export const FaceScanScreen = ({ onNext, onBack, currentStep, totalSteps, onScanActionReady }: FaceScanScreenProps) => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [faceError, setFaceError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState(new Date());
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState<number>(0);
  const [currentEmotion, setCurrentEmotion] = useState<string>(''); // emoji like 😊, 😐, 😫
  const [isCentered, setIsCentered] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const detectorRef = useRef<faceDetection.FaceDetector | null>(null);
  // const landmarkDetectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const animationFrameRef = useRef<number>();
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  // Monotonic timestamp for MediaPipe and detection throttle
  const lastMpTimestampRef = useRef<number>(0);
  const lastDetectTickRef = useRef<number>(0);
  // Smoothing and canvas state for single face
  const smoothedBoxRef = useRef<{ xMin: number; yMin: number; width: number; height: number } | null>(null);
  const lastBoxUpdateRef = useRef<number>(0);
  const canvasDimsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update timestamp every second for digital cam effect
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    startCamera();
    initFaceDetector();
    
    // Play biometric scan audio when entering face scan screen
    const audio = new Audio('/audio/biometric-scan.mp3');
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Register the scan action with parent when camera is ready
  useEffect(() => {
    if (cameraReady && onScanActionReady && !scanning) {
      onScanActionReady(() => startScan);
    }
  }, [cameraReady, scanning, onScanActionReady]);

  const initFaceDetector = async () => {
    try {
      // Initialize face detection via MediaPipe Tasks only (no TFJS backend needed)
      
      // Initialize face landmarks with MediaPipe Tasks Vision (more stable)
      try {
        const fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          },
          runningMode: 'VIDEO',
          outputFaceBlendshapes: true,
          numFaces: 1, // Track only one face
          minFaceDetectionConfidence: 0.3,
          minFacePresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
        });
      } catch (e) {
        console.error('Failed to init FaceLandmarker:', e);
      }
      
      console.log('Face detectors initialized');
    } catch (error) {
      console.error('Failed to initialize face detector:', error);
    }
  };

  // Generate a strictly monotonic timestamp in milliseconds for MediaPipe
  const nextMediapipeTimestampMs = () => {
    const now = Math.floor(performance.now());
    const last = lastMpTimestampRef.current || 0;
    const next = now <= last ? last + 1 : now;
    lastMpTimestampRef.current = next;
    return next;
  };

  const BOX_SMOOTHING = 0.4; // EMA factor for bbox smoothing (increased for faster tracking)
  const LOST_HOLD_MS = 300;  // keep last box for brief dropouts

  const smoothBox = (
    prev: { xMin: number; yMin: number; width: number; height: number } | null,
    curr: { xMin: number; yMin: number; width: number; height: number }
  ) => {
    if (!prev) return curr;
    const a = BOX_SMOOTHING;
    return {
      xMin: prev.xMin + a * (curr.xMin - prev.xMin),
      yMin: prev.yMin + a * (curr.yMin - prev.yMin),
      width: prev.width + a * (curr.width - prev.width),
      height: prev.height + a * (curr.height - prev.height),
    };
  };

  const detectFaces = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      videoRef.current.readyState !== 4
    ) {
      animationFrameRef.current = requestAnimationFrame(detectFaces);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(detectFaces);
      return;
    }

    // Set canvas size to match video (1:1 pixel mapping, no DPR scaling)
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (canvasDimsRef.current.w !== vw || canvasDimsRef.current.h !== vh) {
      canvas.width = vw;
      canvas.height = vh;
      canvasDimsRef.current = { w: vw, h: vh };
    }
    ctx.imageSmoothingEnabled = true;

    try {
      // Use MediaPipe FaceLandmarker exclusively
      // Throttle detection to ~10Hz (every 100ms) for real-time monitor feel
      const nowTick = performance.now();
      if (nowTick - lastDetectTickRef.current < 100) {
        animationFrameRef.current = requestAnimationFrame(detectFaces);
        return;
      }
      lastDetectTickRef.current = nowTick;

      let faces: any[] = [];
      const mpTimestamp = nextMediapipeTimestampMs();
      const mpResult = faceLandmarkerRef.current
        ? faceLandmarkerRef.current.detectForVideo(video, mpTimestamp)
        : null;
      
      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const anyFace = ((mpResult?.faceLandmarks?.length ?? 0) > 0);

      if (anyFace && mpResult?.faceLandmarks && mpResult.faceLandmarks[0]) {
        setFaceDetected(true);
        setFaceError(null);
        
        // Process only the first detected face
        const pts = mpResult.faceLandmarks[0];
        const xs = pts.map(p => p.x * vw);
        const ys = pts.map(p => p.y * vh);
        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);
        const box = { xMin, yMin, width: xMax - xMin, height: yMax - yMin };

        // Smooth bbox for responsive tracking
        smoothedBoxRef.current = smoothBox(smoothedBoxRef.current, box);
        lastBoxUpdateRef.current = nowTick;

        // Detect emotion for the primary face
        let baseConfidence = 30;
        let detectedEmotion = '';
        let finalConfidence = baseConfidence;
        
        if (mpResult?.faceBlendshapes?.[0]?.categories) {
          const cats = mpResult.faceBlendshapes[0].categories as any[];
          
          const smileLeft = cats.find(c => c.categoryName === 'mouthSmileLeft')?.score ?? 0;
          const smileRight = cats.find(c => c.categoryName === 'mouthSmileRight')?.score ?? 0;
          const smileScore = (smileLeft + smileRight) / 2;
          
          const browDownLeft = cats.find(c => c.categoryName === 'browDownLeft')?.score ?? 0;
          const browDownRight = cats.find(c => c.categoryName === 'browDownRight')?.score ?? 0;
          const browDown = (browDownLeft + browDownRight) / 2;
          
          const mouthFrownLeft = cats.find(c => c.categoryName === 'mouthFrownLeft')?.score ?? 0;
          const mouthFrownRight = cats.find(c => c.categoryName === 'mouthFrownRight')?.score ?? 0;
          const frownScore = (mouthFrownLeft + mouthFrownRight) / 2;
          
          const jawOpen = cats.find(c => c.categoryName === 'jawOpen')?.score ?? 0;

          if (smileScore >= 0.6) {
            detectedEmotion = '😊';
            finalConfidence = Math.min(100, baseConfidence + 55);
          } else if (smileScore >= 0.35) {
            detectedEmotion = '😊';
            finalConfidence = Math.min(100, baseConfidence + 40);
          } else if (browDown > 0.4 && frownScore > 0.3) {
            detectedEmotion = '😫';
            finalConfidence = Math.min(100, baseConfidence + 20);
          } else if (jawOpen > 0.5) {
            detectedEmotion = '😮';
            finalConfidence = Math.min(100, baseConfidence + 30);
          } else {
            detectedEmotion = '😐';
            finalConfidence = baseConfidence;
          }
        }

        setCurrentEmotion(detectedEmotion);
        setFaceConfidence(finalConfidence);

        // Draw tracking box for your face
        const drawBox = smoothedBoxRef.current;
        if (drawBox) {
          const canvasCenterX = vw / 2;
          const canvasCenterY = vh / 2;

          const faceCenterX = drawBox.xMin + drawBox.width / 2;
          const faceCenterY = drawBox.yMin + drawBox.height / 2;
          const offsetX = faceCenterX - canvasCenterX;
          const offsetY = faceCenterY - canvasCenterY;

          const centerThreshold = 50;
          const faceCentered = Math.abs(offsetX) < centerThreshold && Math.abs(offsetY) < centerThreshold;
          setIsCentered(faceCentered);

          const x = Math.round(drawBox.xMin);
          const y = Math.round(drawBox.yMin);
          const w = Math.round(drawBox.width);
          const h = Math.round(drawBox.height);

          // Main box
          ctx.strokeStyle = faceCentered ? '#00ff41' : '#ffff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          // Corner brackets
          const cornerLength = 20;
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(x, y + cornerLength); ctx.lineTo(x, y); ctx.lineTo(x + cornerLength, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + w - cornerLength, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLength); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, y + h - cornerLength); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerLength, y + h); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x + w - cornerLength, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerLength); ctx.stroke();

          // Center crosshair
          const centerX = Math.round(x + w / 2);
          const centerY = Math.round(y + h / 2);
          const crossSize = 10;
          ctx.strokeStyle = faceCentered ? '#00ff41' : '#ffff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX - crossSize, centerY); ctx.lineTo(centerX + crossSize, centerY);
          ctx.moveTo(centerX, centerY - crossSize); ctx.lineTo(centerX, centerY + crossSize);
          ctx.stroke();

          // Guidance arrows
          if (!faceCentered) {
            const arrowSize = 40;
            const arrowDistance = 80;
            ctx.fillStyle = '#ffff00';
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;

            if (offsetX < -centerThreshold) {
              const arrowX = canvasCenterX + arrowDistance; const arrowY = canvasCenterY;
              ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX - arrowSize, arrowY - arrowSize / 2); ctx.lineTo(arrowX - arrowSize, arrowY + arrowSize / 2); ctx.closePath(); ctx.fill();
              ctx.font = 'bold 16px monospace'; ctx.fillText('MOVE RIGHT →', arrowX + 10, arrowY + 5);
            } else if (offsetX > centerThreshold) {
              const arrowX = canvasCenterX - arrowDistance; const arrowY = canvasCenterY;
              ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX + arrowSize, arrowY - arrowSize / 2); ctx.lineTo(arrowX + arrowSize, arrowY + arrowSize / 2); ctx.closePath(); ctx.fill();
              ctx.font = 'bold 16px monospace'; ctx.fillText('← MOVE LEFT', arrowX - 120, arrowY + 5);
            }

            if (offsetY < -centerThreshold) {
              const arrowX = canvasCenterX; const arrowY = canvasCenterY + arrowDistance;
              ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX - arrowSize / 2, arrowY - arrowSize); ctx.lineTo(arrowX + arrowSize / 2, arrowY - arrowSize); ctx.closePath(); ctx.fill();
            } else if (offsetY > centerThreshold) {
              const arrowX = canvasCenterX; const arrowY = canvasCenterY - arrowDistance;
              ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX - arrowSize / 2, arrowY + arrowSize); ctx.lineTo(arrowX + arrowSize / 2, arrowY + arrowSize); ctx.closePath(); ctx.fill();
            }
          }
        }
      } else {
        // Briefly hold last known box to avoid flicker
        const hold = nowTick - lastBoxUpdateRef.current < LOST_HOLD_MS;
        const drawBox = hold ? smoothedBoxRef.current : null;
        if (drawBox) {
          setFaceDetected(true);
          const x = Math.round(drawBox.xMin);
          const y = Math.round(drawBox.yMin);
          const w = Math.round(drawBox.width);
          const h = Math.round(drawBox.height);
          ctx.strokeStyle = '#00ff41';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);
        } else {
          smoothedBoxRef.current = null;
          setFaceDetected(false);
          setCurrentEmotion('');
          setFaceConfidence(0);
          setIsCentered(false);
          if (!scanning) {
            setFaceError("No face detected - please position your face in frame");
          }
        }
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectFaces);
  };

  useEffect(() => {
    if (cameraReady) {
      detectFaces();
    }
  }, [cameraReady]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        const el = videoRef.current;
        el.srcObject = stream;
        el.setAttribute('playsinline', 'true');
        try { await el.play(); } catch {}
        
        // Try to set zoom to minimum (wider view) if supported
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities() as any;
        
        if (capabilities.zoom) {
          try {
            await videoTrack.applyConstraints({
              advanced: [{ zoom: capabilities.zoom.min || 1 } as any]
            });
            console.log('Camera zoom set to wide angle');
          } catch (err) {
            console.log('Zoom adjustment not supported:', err);
          }
        }
        
        setCameraReady(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to continue",
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setScanning(true);
    setScanProgress(0);
    setFaceError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageBase64 = e.target?.result as string;
        
        // Set uploaded image to display in canvas
        setUploadedImage(imageBase64);
        
        // Draw image on canvas
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            };
            img.src = imageBase64;
          }
        }
        
        await processImage(imageBase64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process uploaded image",
        variant: "destructive",
      });
      setScanning(false);
      setScanProgress(0);
      setUploadedImage(null);
    }
  };

  const processImage = async (imageBase64: string) => {
    try {

      // Quick validation check for face detection
      console.log('Validating face presence...');
      const validationResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64, quickValidation: true })
        }
      );

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        if (errorData.error?.includes('No face detected') || errorData.error?.includes('face')) {
          setFaceError("No face detected. Please position your face clearly in the center of the frame.");
          setScanning(false);
          setScanProgress(0);
          return;
        }
        throw new Error(errorData.error || 'Failed to validate photo');
      }

      // Animate progress while analyzing
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5;
        });
      }, 200);

      console.log('Sending photo to analyze-photo function...');

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64 })
        }
      );

      clearInterval(interval);
      setScanProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze photo');
      }

      const { analysis } = await response.json();
      console.log('Analysis result:', analysis);

      // Check if face was actually detected in the full analysis
      if (!analysis.age && !analysis.gender && !analysis.emotions) {
        setFaceError("No human face detected in the image. Please upload a photo with a clear human face.");
        setScanning(false);
        setScanProgress(0);
        setUploadedImage(null);
        return;
      }

      // Check if it's a non-human image (animal, object, etc.)
      const isNonHuman = analysis.age?.toLowerCase().includes('not applicable') || 
                         analysis.age?.toLowerCase().includes('n/a') ||
                         analysis.ethnicity?.toLowerCase().includes('animal') ||
                         analysis.ethnicity?.toLowerCase().includes('not human') ||
                         (!analysis.age && analysis.occupation?.toLowerCase().includes('animal'));

      // Generate short personality (like INFP, CALM)
      const shortPersonality = analysis.personality?.split('.')[0]?.toUpperCase().substring(0, 15) || 'CALM, FOCUSED';
      
      // Generate short bio (15 chars max, like Instagram bio)
      const shortBio = (analysis.occupation || 'Creative').substring(0, 15);

      const faceData = {
        age: isNonHuman ? 'Unknown' : (analysis.age || 'Unknown'),
        gender: isNonHuman ? 'Unknown' : (analysis.gender || 'Unknown'),
        ethnicity: isNonHuman ? 'Unknown' : (analysis.ethnicity || 'Unknown'),
        eyeColor: isNonHuman ? 'Unknown' : (analysis.eyeColor || 'Unknown'),
        hairColor: isNonHuman ? 'Unknown' : (analysis.hairColor || 'Unknown'),
        hairStyle: isNonHuman ? 'Unknown' : (analysis.hairStyle || 'Unknown'),
        skinTone: analysis.skinTone,
        facialHair: analysis.facialHair,
        confidence: analysis.confidence === 'high' ? 0.95 : analysis.confidence === 'medium' ? 0.75 : 0.55,
        emotions: [analysis.emotion, shortPersonality],
        occupation: analysis.occupation,
        personality: shortPersonality,
        bio: shortBio,
        photo: imageBase64
      };

      toast({
        title: "Analysis Complete",
        description: "Biometric profile generated successfully",
      });

      // Stop camera and proceed automatically
      stopCamera();
      onNext(faceData);

    } catch (error) {
      console.error('Scan error:', error);
      setScanning(false);
      setScanProgress(0);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const startScan = async () => {
    try {
      // Capture photo from video
      if (!videoRef.current) {
        throw new Error("Camera not ready");
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      ctx.drawImage(videoRef.current, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // Process the captured image
      await processImage(imageBase64);
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: "Capture Failed",
        description: error instanceof Error ? error.message : "Failed to capture photo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full w-full bg-transparent text-beige relative overflow-hidden">
      {/* Camera Feed with Digital Camera Filter - Hide when image uploaded */}
      {!uploadedImage && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'contrast(1.1) saturate(0.85) brightness(0.95)',
            mixBlendMode: 'normal',
            transform: 'scaleX(-1)'
          }}
        />
      )}

      {/* Canvas - Show uploaded image or camera overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: uploadedImage ? 'none' : 'scaleX(-1)' }}
      />

      {/* Digital Camera Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vignette Effect */}
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
          }}
        />
        
        {/* Scan Lines */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
          }}
        />
        
        {/* Simplified HUD - Top */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start font-['SF_Mono',monospace] text-xs text-white z-50">
          {/* Recording indicator */}
          <div className="flex items-center gap-2 px-1 py-[5px]">
            <div className="w-[12px] h-[12px] bg-[#F62121] rounded-full" />
            <span className="text-[14px] leading-none">Recording</span>
          </div>
          
          {/* Timestamp */}
          <div className="text-right px-1 py-[5px]">
            <div className="text-[14px] leading-none">{timestamp.toLocaleTimeString('en-US', { hour12: true })}</div>
          </div>
        </div>
        
        {/* Corner Frame Indicators */}
        <div className="absolute top-16 left-4 w-8 h-8 border-t-2 border-l-2 border-red-500/50" />
        <div className="absolute top-16 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/50" />
        <div className="absolute bottom-32 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/50" />
        <div className="absolute bottom-32 right-4 w-8 h-8 border-b-2 border-r-2 border-red-500/50" />
        
        {/* Bottom Status Bar */}
        {cameraReady && (
          <div className="absolute bottom-20 left-4 right-4 font-mono text-xs text-white/60 bg-black/50 px-3 py-2 rounded flex justify-between items-center">
            <span>AUTO</span>
            <span>AWB</span>
            <span>ISO 400</span>
            <span>1/60</span>
            <span>F2.8</span>
            <span className="text-primary">0.5x WIDE</span>
          </div>
        )}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black-bg/20" />

      {/* Simplified UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Progress Indicator */}
        <div className="absolute top-[36px] left-1/2 -translate-x-1/2 flex gap-[5px] items-center">
          <div className={`size-[3px] border border-black ${currentStep === 1 ? 'bg-white' : 'bg-white opacity-50'}`} />
          <div className={`size-[3px] border border-black ${currentStep === 2 ? 'bg-white' : 'bg-white opacity-50'}`} />
          <div className={`size-[3px] border border-black ${currentStep === 3 ? 'bg-white' : 'bg-white opacity-50'}`} />
          <div className={`size-[3px] border border-black ${currentStep === 4 ? 'bg-white' : 'bg-white opacity-50'}`} />
          <div className={`size-[3px] border border-black ${currentStep === 5 ? 'bg-white' : 'bg-white opacity-50'}`} />
        </div>

        {/* Guide Text - Top Center */}
        {!scanning && cameraReady && (
          <div className="absolute top-[160px] left-1/2 -translate-x-1/2 text-white/60 text-sm text-center font-['SF_Mono',monospace]">
            → MOVE RIGHT
          </div>
        )}

        {/* Bottom Status Text */}
        <div className="absolute bottom-[90px] left-[54px] bg-[rgba(68,68,68,0.5)] px-3 py-2 font-['SF_Mono',monospace] text-[14px] text-white leading-normal whitespace-nowrap">
          <p className="mb-0">
            {!cameraReady && '>initializing camera...'}
            {cameraReady && !scanning && (
              <>
                {'>awaiting permissions: granted'}
                <br />
                {'>scanner initialized'}
                <br />
                {'>awaiting input'}
              </>
            )}
            {scanning && (
              <>
                {'>scanning in progress...'}
                <br />
                {`>progress: ${scanProgress}%`}
              </>
            )}
          </p>
        </div>

        {/* Bottom Left - CAM Label */}
        <div className="absolute bottom-[30px] left-[28px] font-['SF_Mono',monospace] text-[14px] text-white">
          CAM
        </div>

        {/* Bottom Right - UPLOAD Label with Icon */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-[36px] right-[40px] flex items-center gap-2 pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
          disabled={scanning}
        >
          <svg className="w-3 h-4" viewBox="0 0 12 17" fill="none">
            <path d="M6 1L6 11M6 1L2 5M6 1L10 5M1 13L1 16L11 16L11 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-['SF_Mono',monospace] text-[14px] text-white underline">UPLOAD</span>
        </button>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Face Error Alert */}
        {faceError && (
          <div className="absolute top-32 left-4 right-4 z-10 pointer-events-auto">
            <Alert variant="destructive" className="bg-destructive/90 backdrop-blur-sm border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive-foreground">
                {faceError}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
