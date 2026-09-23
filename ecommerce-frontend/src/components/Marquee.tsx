// A bold editorial ticker. The track holds the items twice so the -50% loop is
// seamless. Pauses on hover; static under reduced-motion.
const ITEMS = [
  "NEW SEASON",
  "FREE RETURNS",
  "FAST · SECURE CHECKOUT",
  "HAND-PICKED",
  "REAL STOCK, REAL TIME",
];

export default function Marquee() {
  const run = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-mask group overflow-hidden border-y border-line py-3">
      <div className="marquee-track flex w-max whitespace-nowrap group-hover:[animation-play-state:paused]">
        {run.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              {item}
            </span>
            <span className="mx-6 text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
