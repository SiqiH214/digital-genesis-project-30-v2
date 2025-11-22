import { ReactNode, useEffect, useState } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  onMainAction?: () => void;
  mainActionLabel?: string;
  mainActionDisabled?: boolean;
  showLeftButton?: boolean;
  showRightButton?: boolean;
  onLeftButtonAction?: () => void;
  leftButtonDisabled?: boolean;
  onRightButtonAction?: () => void;
  rightButtonDisabled?: boolean;
  rightButtonLabel?: string;
}

export const PhoneFrame = ({ 
  children, 
  onMainAction, 
  mainActionLabel = "Start", 
  mainActionDisabled = false,
  showLeftButton = true,
  showRightButton = true,
  onLeftButtonAction,
  leftButtonDisabled = false,
  onRightButtonAction,
  rightButtonDisabled = false,
  rightButtonLabel
}: PhoneFrameProps) => {
  const [scale, setScale] = useState(1);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const frameWidth = 393;
      const frameHeight = 852;
      const padding = 20; // Minimum padding around the frame

      // Calculate scale to fit width and height
      const scaleX = (viewportWidth - padding) / frameWidth;
      const scaleY = (viewportHeight - padding) / frameHeight;
      
      // Use the smaller scale to ensure it fits both dimensions
      // Cap at 1.05 to avoid becoming too large on massive screens, but allow filling smaller screens
      const newScale = Math.min(scaleX, scaleY, 1.05);
      
      setScale(newScale);
    };

    // Initial calculate
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden transition-colors duration-300 ${isLightMode ? 'bg-[#e0e0e0] light-mode' : 'bg-[#0a0a0a]'}`}>
      
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsLightMode(!isLightMode)}
        className="absolute top-6 right-6 z-[100] p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer group"
        title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        {isLightMode ? (
          // Pixel Moon Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black w-6 h-6">
            <path d="M14 2H16V4H14V2Z" fill="currentColor"/>
            <path d="M16 4H18V6H16V4Z" fill="currentColor"/>
            <path d="M18 6H20V12H18V6Z" fill="currentColor"/>
            <path d="M16 12H18V14H16V12Z" fill="currentColor"/>
            <path d="M14 14H16V16H14V14Z" fill="currentColor"/>
            <path d="M10 16H14V18H10V16Z" fill="currentColor"/>
            <path d="M8 14H10V16H8V14Z" fill="currentColor"/>
            <path d="M6 12H8V14H6V12Z" fill="currentColor"/>
            <path d="M6 6H8V12H6V6Z" fill="currentColor"/>
            <path d="M8 4H10V6H8V4Z" fill="currentColor"/>
            <path d="M10 2H14V4H10V2Z" fill="currentColor"/>
          </svg>
        ) : (
          // Pixel Sun Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-400 w-6 h-6">
            <rect x="10" y="2" width="4" height="4" fill="currentColor"/>
            <rect x="10" y="18" width="4" height="4" fill="currentColor"/>
            <rect x="2" y="10" width="4" height="4" fill="currentColor"/>
            <rect x="18" y="10" width="4" height="4" fill="currentColor"/>
            <rect x="6" y="6" width="4" height="4" fill="currentColor"/>
            <rect x="14" y="6" width="4" height="4" fill="currentColor"/>
            <rect x="6" y="14" width="4" height="4" fill="currentColor"/>
            <rect x="14" y="14" width="4" height="4" fill="currentColor"/>
            <rect x="8" y="8" width="8" height="8" fill="currentColor"/>
          </svg>
        )}
      </button>

      <div
        className="relative w-[393px] h-[852px] transition-transform duration-300 ease-out origin-center will-change-transform"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Main Phone Body */}
        <div className={`absolute inset-0 rounded-[64px] overflow-hidden shadow-2xl transition-colors duration-300 ${isLightMode ? 'bg-[#f5f5f7] shadow-[0_20px_50px_rgba(0,0,0,0.1)]' : 'bg-[#1a1a1a] shadow-2xl'}`}>
          
          {/* Background Effects - CSS Gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent ${isLightMode ? 'to-black/[0.02]' : 'to-white/[0.02]'}`} />
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `radial-gradient(circle at 80% 50%, ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} 0%, transparent 50%)`
            }} />
          </div>

          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-[58px] z-50">
            <div className={`absolute top-1/2 -translate-y-1/2 left-[32px] font-bold text-[17px] tracking-[-0.4px] transition-colors ${isLightMode ? 'text-black' : 'text-white'}`}>
              9:41
            </div>
            
            {/* Pika Logo - Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <img 
                src="https://www.figma.com/api/mcp/asset/442ad010-81b9-4b08-8e78-59a45136f1ca" 
                alt="Pika" 
                className={`h-[10px] w-[32px] object-contain ${isLightMode ? 'invert' : ''}`}
              />
            </div>
            
            <div className="absolute top-1/2 -translate-y-1/2 right-[32px] flex items-center gap-[7px]">
              {/* Cellular Signal Icon */}
              <svg className="w-[19px] h-[12px]" viewBox="0 0 19 12" fill={isLightMode ? "black" : "white"}>
                <rect x="0" y="8" width="2" height="4" rx="0.5" />
                <rect x="3.5" y="6" width="2" height="6" rx="0.5" />
                <rect x="7" y="4" width="2" height="8" rx="0.5" />
                <rect x="10.5" y="2" width="2" height="10" rx="0.5" />
                <rect x="14" y="0" width="2" height="12" rx="0.5" />
              </svg>
              
              {/* WiFi Icon */}
              <svg className="w-[17px] h-[12px]" viewBox="0 0 17 12" fill={isLightMode ? "black" : "white"}>
                <path d="M8.5 11.5C9.05 11.5 9.5 11.05 9.5 10.5C9.5 9.95 9.05 9.5 8.5 9.5C7.95 9.5 7.5 9.95 7.5 10.5C7.5 11.05 7.95 11.5 8.5 11.5Z"/>
                <path d="M8.5 7.5C10.16 7.5 11.64 8.23 12.66 9.37L11.24 10.79C10.58 10.13 9.64 9.71 8.5 9.71C7.36 9.71 6.42 10.13 5.76 10.79L4.34 9.37C5.36 8.23 6.84 7.5 8.5 7.5Z"/>
                <path d="M8.5 3.5C11.26 3.5 13.8 4.65 15.56 6.56L14.14 7.98C12.74 6.49 10.76 5.58 8.5 5.58C6.24 5.58 4.26 6.49 2.86 7.98L1.44 6.56C3.2 4.65 5.74 3.5 8.5 3.5Z"/>
                <path d="M8.5 0C12.5 0 16.14 1.73 18.63 4.56L17.21 5.98C15.08 3.55 11.97 2 8.5 2C5.03 2 1.92 3.55 -0.21 5.98L-1.63 4.56C0.86 1.73 4.5 0 8.5 0Z" opacity="0.3"/>
              </svg>
              
              {/* Battery Icon */}
              <div className="relative w-[27px] h-[13px]">
                {/* Battery body */}
                <svg className="w-[27px] h-[13px]" viewBox="0 0 27 13" fill="none">
                  <rect x="0" y="1" width="22" height="11" rx="2.5" stroke={isLightMode ? "black" : "white"} strokeWidth="1" opacity="0.4"/>
                  <rect x="23" y="4" width="1.5" height="5" rx="0.75" fill={isLightMode ? "black" : "white"} opacity="0.4"/>
                </svg>
                {/* Battery level */}
                <div className={`absolute top-1/2 -translate-y-1/2 left-[2px] h-[9px] w-[18px] rounded-[2px] ${isLightMode ? 'bg-black' : 'bg-white'}`} />
              </div>
            </div>
          </div>


          {/* Main Screen Area */}
          <div className="absolute top-[66px] left-1/2 -translate-x-1/2 w-[355px] h-[620px] rounded-[48px] overflow-hidden bg-black-bg">
        {/* Screen Content */}
            <div className="relative w-full h-full z-10">
          {children}
            </div>

            {/* Screen Overlays (Glass Effect with CSS) */}
            <div className="absolute inset-0 pointer-events-none z-20 rounded-[48px] overflow-hidden">
              {/* Glass reflection effect - Subtle gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-white/20 via-transparent to-black/5' : 'from-white/10 via-transparent to-transparent'}`} />
              
              {/* Vintage grain effect */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }} />
              
              {/* Liquid Glass Border & Shadow - Combined for depth */}
              <div className={`absolute inset-0 rounded-[48px] border-[2px] transition-all duration-300 ${
                isLightMode 
                  ? 'border-black/5 shadow-[inset_0_0_15px_rgba(0,0,0,0.05),inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,0,0,0.05)]' 
                  : 'border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.1)]'
              }`} />
              
              {/* Additional highlight for the "Liquid" feel on top edge */}
              <div className={`absolute top-2 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-40`} />
            </div>
          </div>

          {/* Bottom Hardware Controls - New Design */}
          
              {/* Left Button - Yellow with Up Triangle */}
          {showLeftButton && (
            <button
              onClick={onLeftButtonAction}
              disabled={leftButtonDisabled}
              className="absolute bottom-[56px] left-[47px] w-[72px] h-[72px] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="relative w-[60px] h-[60px] flex items-center justify-center">
                {/* Outer ring */}
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  isLightMode 
                    ? 'bg-white/40 backdrop-blur-xl border border-white/80 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.05)]' 
                    : 'bg-black shadow-[0_6px_20px_rgba(0,0,0,0.4)]'
                }`} />
                {/* Yellow gradient button */}
                <div className="absolute inset-[6px] rounded-full bg-gradient-to-b from-[#FFD700] to-[#FFA500] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_4px_8px_rgba(0,0,0,0.3)]" />
                {/* Up triangle icon */}
                <svg className="relative z-10 w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M10 6L14 12H6L10 6Z" fill={isLightMode ? "#1a1a1a" : "black"} stroke={isLightMode ? "#1a1a1a" : "black"} strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              {/* Decorative dots below */}
              <div className="flex gap-[4px] mt-2">
                <div className={`w-[3px] h-[3px] rounded-full ${isLightMode ? 'bg-black/40' : 'bg-white/60'}`} />
                <div className={`w-[3px] h-[3px] rounded-full ${isLightMode ? 'bg-black/20' : 'bg-white/40'}`} />
                <div className={`w-[3px] h-[3px] rounded-full ${isLightMode ? 'bg-black/40' : 'bg-white/60'}`} />
              </div>
            </button>
          )}

          {/* Center Button - Purple with Dynamic Icon */}
          <button
            onClick={onMainAction}
            disabled={mainActionDisabled}
            className="absolute bottom-[54px] left-[148px] w-[98px] h-[98px] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                isLightMode 
                  ? 'bg-white/40 backdrop-blur-xl border border-white/80 shadow-[inset_0_4px_20px_rgba(255,255,255,0.9),0_12px_30px_rgba(0,0,0,0.08)]' 
                  : 'bg-black shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
              }`} />
              {/* Purple gradient button */}
              <div className="absolute inset-[8px] rounded-full bg-gradient-to-b from-[#C084FC] via-[#A855F7] to-[#7C3AED] shadow-[inset_0_3px_6px_rgba(255,255,255,0.4),0_6px_16px_rgba(0,0,0,0.4)]" />
              
              {/* Dynamic Icon - Based on Label */}
              {mainActionLabel === "Start" ? (
                // Play triangle icon for Start
                <svg className="relative z-10 w-8 h-8" viewBox="0 0 32 32" fill="none">
                  <path d="M12 8L24 16L12 24V8Z" fill={isLightMode ? "#1a1a1a" : "black"} stroke={isLightMode ? "#1a1a1a" : "black"} strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              ) : mainActionLabel === "Capture" ? (
                // Camera/Circle icon for Capture
                <svg className="relative z-10 w-8 h-8" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="10" stroke={isLightMode ? "#1a1a1a" : "black"} strokeWidth="2.5" fill="none"/>
                  <circle cx="16" cy="16" r="6" fill={isLightMode ? "#1a1a1a" : "black"}/>
                </svg>
              ) : mainActionLabel === "Record" ? (
                // Record dot icon
                <svg className="relative z-10 w-8 h-8" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="8" fill={isLightMode ? "#1a1a1a" : "black"}/>
                </svg>
              ) : mainActionLabel === "Next" ? (
                // Check mark icon for Next
                <svg className="relative z-10 w-9 h-9" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16L13 23L26 10" stroke={isLightMode ? "#1a1a1a" : "black"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : mainActionLabel === "End" ? (
                // Stop/Square icon for End
                <svg className="relative z-10 w-8 h-8" viewBox="0 0 32 32" fill="none">
                  <rect x="10" y="10" width="12" height="12" rx="1" fill={isLightMode ? "#1a1a1a" : "black"}/>
                </svg>
              ) : (
                // Default: Play icon
                <svg className="relative z-10 w-8 h-8" viewBox="0 0 32 32" fill="none">
                  <path d="M12 8L24 16L12 24V8Z" fill={isLightMode ? "#1a1a1a" : "black"} stroke={isLightMode ? "#1a1a1a" : "black"} strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            {/* Label below button */}
            <div className={`absolute top-[100px] text-[14px] font-['SF_Mono',monospace] tracking-wide transition-colors ${isLightMode ? 'text-black/60' : 'text-[#B7F699]'}`}>
              {mainActionLabel}
            </div>
          </button>

          {/* Right Button - Yellow with Down Triangle */}
          {showRightButton && (
            <button
              onClick={onRightButtonAction}
              disabled={rightButtonDisabled}
              className="absolute bottom-[56px] left-[285px] w-[72px] h-[72px] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="relative w-[60px] h-[60px] flex items-center justify-center">
                {/* Outer ring */}
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  isLightMode 
                    ? 'bg-white/40 backdrop-blur-xl border border-white/80 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.05)]' 
                    : 'bg-black shadow-[0_6px_20px_rgba(0,0,0,0.4)]'
                }`} />
                {/* Yellow gradient button */}
                <div className="absolute inset-[6px] rounded-full bg-gradient-to-b from-[#FFD700] to-[#FFA500] shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_4px_8px_rgba(0,0,0,0.3)]" />
                {/* Down triangle icon */}
                <svg className="relative z-10 w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M10 14L6 8H14L10 14Z" fill={isLightMode ? "#1a1a1a" : "black"} stroke={isLightMode ? "#1a1a1a" : "black"} strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              {/* Decorative dots below */}
              <div className="flex gap-[4px] mt-2">
                <div className={`w-[3px] h-[3px] rounded-full ${isLightMode ? 'bg-black/40' : 'bg-white/60'}`} />
                <div className={`w-[3px] h-[3px] rounded-full ${isLightMode ? 'bg-black/20' : 'bg-white/40'}`} />
                <div className={`w-[3px] h-[3px] rounded-full ${isLightMode ? 'bg-black/40' : 'bg-white/60'}`} />
              </div>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
