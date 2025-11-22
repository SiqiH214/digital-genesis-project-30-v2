import { useState, useEffect } from "react";

// Pika logo animation frames from Figma
const frames = [
  "https://www.figma.com/api/mcp/asset/020d7fbf-fc8b-40a5-976b-05392995a04e", // Default
  "https://www.figma.com/api/mcp/asset/6784f97f-baec-45c5-9077-6aff3f9c7775", // Variant4
  "https://www.figma.com/api/mcp/asset/d5f0cad0-1901-4bb4-a517-084d5174cb43", // Variant2
  "https://www.figma.com/api/mcp/asset/7161bd39-c621-45a2-b54e-4149dbcff175", // Variant3
  "https://www.figma.com/api/mcp/asset/b5997d08-05e5-4358-a6d7-a047da780568", // Variant5
];

export const AnimatedPikaLogo = () => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const frameInterval = 2000 / frames.length; // 2s total / number of frames
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, frameInterval);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[220px] h-[198px] flex items-center justify-center">
      <img
        src={frames[currentFrame]}
        alt="Pika Logo Animation"
        className="w-full h-full object-contain"
        style={{ 
          imageRendering: "pixelated",
          filter: "brightness(1.1) contrast(1.05) invert(1)"
        }}
      />
    </div>
  );
};
