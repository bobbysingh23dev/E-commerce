import { useCountUp } from "../hooks/useCountUp";

// Integer count-up (with thousands separators) — the sibling of AnimatedPrice.
export default function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const animated = useCountUp(value);
  return <span className={className}>{Math.round(animated).toLocaleString()}</span>;
}
