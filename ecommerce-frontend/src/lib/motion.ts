// Small, dependency-free motion helpers built on the Web Animations API.

export function prefersReduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// Fling a glowing dot from `sourceEl` in an arc to the cart icon in the nav.
export function flyToCart(sourceEl: HTMLElement | null) {
  if (!sourceEl || prefersReduced()) return;
  const target = document.getElementById("cart-icon");
  if (!target) return;

  const s = sourceEl.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const startX = s.left + s.width / 2;
  const startY = s.top + s.height / 2;
  const dx = t.left + t.width / 2 - startX;
  const dy = t.top + t.height / 2 - startY;

  const dot = document.createElement("div");
  dot.style.cssText = `position:fixed;left:${startX}px;top:${startY}px;width:16px;height:16px;border-radius:9999px;background:linear-gradient(135deg,#8b5cf6,#6366f1);box-shadow:0 0 18px rgba(139,92,246,.9);z-index:120;pointer-events:none;transform:translate(-50%,-50%);`;
  document.body.appendChild(dot);

  const anim = dot.animate(
    [
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0 },
      {
        transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 70}px)) scale(0.9)`,
        opacity: 1,
        offset: 0.5,
      },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.15)`,
        opacity: 0.3,
        offset: 1,
      },
    ],
    { duration: 750, easing: "cubic-bezier(.5,0,.75,1)" },
  );
  anim.onfinish = () => {
    dot.remove();
    // Pop the cart icon when the dot lands.
    target.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.35)" },
        { transform: "scale(1)" },
      ],
      { duration: 320, easing: "ease-out" },
    );
  };
}

// A confetti burst centered near the top of the viewport.
export function confetti() {
  if (prefersReduced()) return;
  const colors = ["#8b5cf6", "#6366f1", "#a78bfa", "#22d3ee", "#f472b6", "#34d399"];
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 3;

  for (let i = 0; i < 70; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 7;
    const color = colors[i % colors.length];
    const round = Math.random() > 0.5;
    p.style.cssText = `position:fixed;left:${originX}px;top:${originY}px;width:${size}px;height:${size}px;background:${color};border-radius:${round ? "9999px" : "2px"};z-index:120;pointer-events:none;transform:translate(-50%,-50%);`;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 200;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const fall = 240 + Math.random() * 240;
    const spin = Math.random() * 720 - 360;

    const anim = p.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1, offset: 0 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin}deg)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + fall}px)) rotate(${spin * 1.6}deg)`,
          opacity: 0,
          offset: 1,
        },
      ],
      { duration: 1300 + Math.random() * 900, easing: "cubic-bezier(.2,.6,.4,1)" },
    );
    anim.onfinish = () => p.remove();
  }
}
