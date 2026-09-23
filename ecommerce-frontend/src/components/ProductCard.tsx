import { useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { flyToCart } from "../lib/motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const outOfStock = product.stock_quantity <= 0;
  const hue = (product.id * 47) % 360;
  const cover = {
    backgroundImage: `radial-gradient(120% 120% at 20% 0%, hsl(${hue} 85% 62% / 0.95), transparent 55%), linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 55) % 360} 65% 38%))`,
  };

  async function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }
    const btn = e.currentTarget;
    setBusy(true);
    try {
      await addItem(product.id);
      flyToCart(btn);
      toast(`${product.name} added to cart`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="card reveal group flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[0_24px_60px_-28px_rgba(139,92,246,0.55)]"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Cover — the gradient zooms slowly on hover (cinematic), and a
          "Quick add" bar rises from the bottom. Motion that REVEALS. */}
      <div className="relative h-44 overflow-hidden">
        <Link
          to={`/products/${product.id}`}
          className="absolute inset-0 block transition-transform duration-900 ease-out group-hover:scale-[1.12]"
          style={cover}
        >
          <span className="absolute inset-0 grid place-items-center font-display text-7xl font-bold text-white/25">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </Link>

        {product.category_name && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            {product.category_name}
          </span>
        )}
        {outOfStock && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-red-300 backdrop-blur-sm">
            Sold out
          </span>
        )}

        {/* Quick-add bar — hidden below the cover, slides up on hover. */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black/70 to-transparent p-3 pt-8 transition-transform duration-300 ease-out group-hover:translate-y-0">
            <button
              onClick={handleAdd}
              disabled={busy}
              className="w-full rounded-lg bg-white/95 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:opacity-60"
            >
              {!user ? "Log in to add" : busy ? "Adding…" : "Quick add +"}
            </button>
          </div>
        )}
      </div>

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
          {/* Fallback add button (touch devices don't hover). */}
          <button
            onClick={handleAdd}
            disabled={outOfStock || busy}
            className="btn-primary px-3.5 py-2 text-xs md:hidden"
          >
            {outOfStock ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
