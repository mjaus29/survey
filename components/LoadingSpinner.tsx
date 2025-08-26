import Image from "next/image";

type LoadingSpinnerProps = {
  size?: number;
  className?: string;
  inverted?: boolean;
};

export const LoadingSpinner = ({
  size = 24,
  className = "",
  inverted = false,
}: LoadingSpinnerProps) => (
  <Image
    src="/loader.svg"
    alt="Loading..."
    width={size}
    height={size}
    className={`animate-spin ${inverted ? "invert" : ""} ${className}`.trim()}
  />
);
