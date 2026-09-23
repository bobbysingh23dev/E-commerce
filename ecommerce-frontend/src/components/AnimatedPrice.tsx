import { useCountUp } from "../hooks/useCountUp";

// Renders a money value that counts up to its target. Accepts the backend's
// string prices ("59.97") or a number.
export default function AnimatedPrice({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  const target = typeof value === "string" ? Number(value) : value;
  const animated = useCountUp(Number.isNaN(target) ? 0 : target);
  return <span className={className}>${animated.toFixed(2)}</span>;
}
