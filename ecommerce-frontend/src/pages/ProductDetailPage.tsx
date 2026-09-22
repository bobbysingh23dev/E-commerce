import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getProduct(productId)
      .then((data) => {
        if (!ignore) setProduct(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message ?? "Failed to load product");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [productId]);

  if (loading) return <p className="text-slate-500">Loading…</p>;

  if (error || !product) {
    return (
      <div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error ?? "Product not found"}
        </div>
        <Link to="/" className="mt-4 inline-block text-sm underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock_quantity <= 0;

  async function handleAdd() {
    if (!product) return;
    // Server cart → must be logged in. Bounce to login, then back to this page.
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    setBusy(true);
    try {
      await addItem(product.id);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500); // brief "Added!" feedback
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to products
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          {product.category_name && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {product.category_name}
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-3 text-slate-600">{product.description}</p>
        )}

        <p className="mt-4 text-3xl font-bold text-slate-900">
          ${product.price}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {outOfStock ? "Out of stock" : `${product.stock_quantity} in stock`}
        </p>

        <button
          onClick={handleAdd}
          disabled={outOfStock || busy}
          className="mt-6 rounded-md bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
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
  );
}
