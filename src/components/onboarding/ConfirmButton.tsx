import { Button } from "@/components/ui/button";

interface ConfirmButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const ConfirmButton = ({ onClick, disabled, children }: ConfirmButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full font-mono mt-4 bg-beige text-black-bg hover:bg-beige/90"
    >
      {children}
    </Button>
  );
};
