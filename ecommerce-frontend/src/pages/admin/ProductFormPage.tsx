import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProduct,
  createProduct,
  updateProduct,
} from "../../api/products";
import { getCategories } from "../../api/categories";
import type { Category, ProductInput } from "../../types";
import { ApiError } from "../../api/client";
import AdminNav from "../../components/AdminNav";
import TextField from "../../components/TextField";

export default function ProductFormPage() {
  // If there's an :id in the URL we're EDITING; otherwise we're CREATING.
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();

  // Form fields are all strings (that's what inputs give us); we convert on save.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState(""); // "" = uncategorized

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit); // only edit needs a fetch
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);

  // Load categories for the dropdown (both modes).
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // In edit mode, fetch the product and prefill the form.
  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;
    getProduct(Number(id))
      .then((p) => {
        if (ignore) return;
        setName(p.name);
        setDescription(p.description ?? "");
        setPrice(p.price); // price is a string on reads — perfect for an input
        setStock(String(p.stock_quantity));
        setCategoryId(p.category_id ? String(p.category_id) : "");
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
  }, [id, isEdit]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDetails([]);
    setSubmitting(true);

    // Build the payload the backend expects — numbers, not strings.
    const input: ProductInput = {
      name: name.trim(),
      description: description.trim() === "" ? null : description.trim(),
      price: Number(price),
      stock_quantity: Number(stock || 0),
      category_id: categoryId ? Number(categoryId) : null,
    };

    try {
      if (isEdit) {
        await updateProduct(Number(id), input);
      } else {
        await createProduct(input);
      }
      navigate("/admin/products");
    } catch (err) {
      // Validation errors arrive as ApiError with a details[] array.
      if (err instanceof ApiError) {
        setError(err.message);
        setDetails(err.details ?? []);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <AdminNav />

      <h1 className="mb-4 text-2xl font-bold text-slate-900">
        {isEdit ? "Edit product" : "New product"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">{error}</p>
            {details.length > 0 && (
              <ul className="mt-1 list-inside list-disc">
                {details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <TextField label="Name" value={name} onChange={setName} required />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </label>

        <div className="flex gap-4">
          <div className="flex-1">
            <TextField
              label="Price"
              type="number"
              value={price}
              onChange={setPrice}
              required
            />
          </div>
          <div className="flex-1">
            <TextField
              label="Stock quantity"
              type="number"
              value={stock}
              onChange={setStock}
            />
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Category
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-5 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-md border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
