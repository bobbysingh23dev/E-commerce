import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/products";
import type { Product } from "../../types";
import AdminNav from "../../components/AdminNav";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getProducts({ limit: 100, sort: "id", order: "asc" })
      .then((res) => {
        if (!ignore) setProducts(res.data);
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

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`))
      return;
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <AdminNav />

      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage products</h1>
        <Link to="/admin/products/new" className="btn-primary">
          + New product
        </Link>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-fg">{p.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {p.category_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-fg">${p.price}</td>
                  <td className="px-4 py-3 text-right text-fg">
                    {p.stock_quantity}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="text-accent-3 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      className="ml-4 text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
