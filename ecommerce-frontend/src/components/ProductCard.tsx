import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock_quantity <= 0;

  // No product images? Generate a unique, good-looking gradient per product so
  // the grid feels designed, not empty. Deterministic: same id → same colors.
  const hue = (product.id * 47) % 360;
  const cover = {
    backgroundImage: `radial-gradient(120% 120% at 20% 0%, hsl(${hue} 85% 62% / 0.95), transparent 55%), linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 55) % 360} 65% 38%))`,
  };

  async function handleAdd() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }
    setBusy(true);
    try {
      await addItem(product.id);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-[0_24px_60px_-24px_rgba(139,92,246,0.65)]">
      {/* Gradient cover with the product initial */}
      <Link
        to={`/products/${product.id}`}
        className="relative block h-40 overflow-hidden"
        style={cover}
      >
        <span className="absolute inset-0 grid place-items-center font-display text-7xl font-bold text-white/25 transition-transform duration-500 group-hover:scale-110">
          {product.name.charAt(0).toUpperCase()}
        </span>
        {product.category_name && (
          <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            {product.category_name}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-red-300 backdrop-blur-sm">
            Sold out
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold">
          <Link
            to={`/products/${product.id}`}
            className="transition-colors hover:text-accent-3"
          >
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xl font-bold text-fg">${product.price}</p>
            {!outOfStock && (
              <p className="text-xs text-faint">
                {product.stock_quantity} in stock
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock || busy}
            className="btn-primary px-3.5 py-2 text-xs"
          >
            {outOfStock
              ? "Unavailable"
              : !user
                ? "Log in to add"
                : busy
                  ? "Adding…"
                  : added
                    ? "Added ✓"
                    : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
