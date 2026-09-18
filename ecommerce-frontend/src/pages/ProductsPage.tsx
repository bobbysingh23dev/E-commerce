import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  // useState gives you a value + a setter. Changing it re-renders the component.
  // We track three things: the data, whether we're still loading, and any error.
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect runs AFTER the first render. The empty [] dependency array means
  // "run once when this page mounts" — perfect for fetching initial data.
  useEffect(() => {
    // `ignore` guards against setting state after the component unmounts
    // (e.g. user navigates away mid-request). Classic React gotcha.
    let ignore = false;

    getProducts()
      .then((data) => {
        if (!ignore) setProducts(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message ?? "Failed to load products");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Render different UI depending on the state. This "loading / error / data"
  // trio is a pattern you'll repeat on every data-fetching page.
  if (loading) {
    return <p className="text-slate-500">Loading products…</p>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Couldn&apos;t load products</p>
        <p className="text-sm">{error}</p>
        <p className="mt-2 text-sm text-red-600">
          Is the backend running on http://localhost:4000?
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Products</h1>

      {products.length === 0 ? (
        <p className="text-slate-500">No products yet.</p>
      ) : (
        // A responsive grid: 1 column on phones, 2 on tablets, 3 on desktop.
        // .map() turns each product into a <ProductCard>. `key` must be unique
        // and stable so React can track list items efficiently.
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
