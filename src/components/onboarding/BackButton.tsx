import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="text-beige/60 hover:text-beige transition-colors"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
};
