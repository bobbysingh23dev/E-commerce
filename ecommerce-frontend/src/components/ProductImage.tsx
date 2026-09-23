import { useState } from "react";
import type { Product } from "../types";

// Shows the product's real image. If there's no image_url — or it fails to
// load — it falls back to the deterministic gradient + initial, so the grid
// never shows a broken image. `className` receives the zoom/transition classes.
export default function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const hue = (product.id * 47) % 360;
  const gradient = {
    backgroundImage: `radial-gradient(120% 120% at 20% 0%, hsl(${hue} 85% 62% / 0.95), transparent 55%), linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 55) % 360} 65% 38%))`,
  };

  if (product.image_url && !failed) {
    return (
      <img
        src={product.image_url}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`grid h-full w-full place-items-center ${className}`}
      // container-type lets the initial scale to the box via cqmin (works in the
      // big card cover AND the tiny admin thumbnail).
      style={{ ...gradient, containerType: "size" }}
    >
      <span
        className="font-display font-bold leading-none text-white/25"
        style={{ fontSize: "48cqmin" }}
      >
        {product.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
