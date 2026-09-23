// A distinctive logomark: a gradient tile with a white "spark" glyph — echoing
// the ✦ motif used across the site. Self-contained SVG (its own gradient).
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient
          id="logo-grad"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#a78bfa" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
      {/* Four-point spark */}
      <path
        d="M16 6c.9 4.6 3.4 7.1 8 8-4.6.9-7.1 3.4-8 8-.9-4.6-3.4-7.1-8-8 4.6-.9 7.1-3.4 8-8Z"
        fill="white"
      />
      <circle cx="16" cy="16" r="1.6" fill="#8b5cf6" />
    </svg>
  );
}
