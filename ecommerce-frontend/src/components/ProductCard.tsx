import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// Props are how a parent passes data INTO a component.
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

  async function handleAdd() {
    // The cart lives on the server now, so you must be logged in to add.
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
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">
          <Link to={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        {product.category_name && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {product.category_name}
          </span>
        )}
      </div>

      {product.description && (
        <p className="mt-1 text-sm text-slate-500">{product.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-lg font-bold text-slate-900">
          ${product.price}
        </span>
        {outOfStock ? (
          <span className="text-sm font-medium text-red-600">Out of stock</span>
        ) : (
          <span className="text-sm text-slate-500">
            {product.stock_quantity} in stock
          </span>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={outOfStock || busy}
        className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
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
  );
}
