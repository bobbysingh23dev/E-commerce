import { useEffect, useState, type MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Magnetic from "../components/Magnetic";
import { flyToCart } from "../lib/motion";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();
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

  if (loading) return <p className="text-muted">Loading…</p>;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="alert-error">{error ?? "Product not found"}</div>
        <Link to="/" className="mt-4 inline-block link-muted text-sm">
          ← Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock_quantity <= 0;
  const hue = (product.id * 47) % 360;
  const cover = {
    backgroundImage: `radial-gradient(120% 120% at 20% 0%, hsl(${hue} 85% 62% / 0.95), transparent 55%), linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 55) % 360} 65% 38%))`,
  };

  async function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    if (!product) return;
    if (!user) {
      navigate("/login", {
        state: { from: { pathname: `/products/${product.id}` } },
      });
      return;
    }
    const btn = e.currentTarget;
    setBusy(true);
    try {
      await addItem(product.id);
      flyToCart(btn);
      toast(`${product.name} added to cart`, "success");
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/" className="mb-4 inline-block link-muted text-sm">
        ← Back to products
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gradient hero */}
        <div
          className="relative grid h-72 place-items-center overflow-hidden rounded-3xl border border-line md:h-full md:min-h-80"
          style={cover}
        >
          <span className="font-display text-9xl font-bold text-white/25">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Details */}
        <div className="card flex flex-col p-7">
          {product.category_name && (
            <span className="chip mb-3 self-start">{product.category_name}</span>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {product.description && (
            <p className="mt-3 text-muted">{product.description}</p>
          )}

          <p className="mt-6 gradient-text font-display text-4xl font-bold">
            ${product.price}
          </p>
          <p className="mt-1 text-sm text-faint">
            {outOfStock ? "Out of stock" : `${product.stock_quantity} in stock`}
          </p>

          <Magnetic className="mt-6 self-start">
            <button
              onClick={handleAdd}
              disabled={outOfStock || busy}
              className="btn-primary px-6 py-3 text-base"
            >
              {outOfStock
                ? "Unavailable"
                : !user
                  ? "Log in to add"
                  : busy
                    ? "Adding…"
                    : added
                      ? "Added to cart ✓"
                      : "Add to cart"}
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
