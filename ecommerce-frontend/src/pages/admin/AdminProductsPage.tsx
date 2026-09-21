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
    // Admin table: grab a big page. (A real admin UI would paginate too.)
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
      // Remove it from the list without refetching (immutable filter).
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <AdminNav />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Manage products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + New product
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 text-right font-medium">Price</th>
                <th className="px-4 py-2 text-right font-medium">Stock</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {p.category_name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900">
                    ${p.price}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-900">
                    {p.stock_quantity}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="text-slate-700 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      className="ml-3 text-red-600 hover:underline"
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
