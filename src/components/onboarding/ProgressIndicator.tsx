interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1 w-6 rounded-full transition-all ${
              index < currentStep
                ? 'bg-beige'
                : index === currentStep
                ? 'bg-beige/60'
                : 'bg-beige/20'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-beige/60 font-mono">
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  );
};
