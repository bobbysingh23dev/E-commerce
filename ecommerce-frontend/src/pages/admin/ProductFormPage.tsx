import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, createProduct, updateProduct } from "../../api/products";
import { getCategories } from "../../api/categories";
import type { Category, ProductInput } from "../../types";
import { ApiError } from "../../api/client";
import AdminNav from "../../components/AdminNav";
import TextField from "../../components/TextField";

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let ignore = false;
    getProduct(Number(id))
      .then((p) => {
        if (ignore) return;
        setName(p.name);
        setDescription(p.description ?? "");
        setPrice(p.price);
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

    const input: ProductInput = {
      name: name.trim(),
      description: description.trim() === "" ? null : description.trim(),
      price: Number(price),
      stock_quantity: Number(stock || 0),
      category_id: categoryId ? Number(categoryId) : null,
    };

    try {
      if (isEdit) await updateProduct(Number(id), input);
      else await createProduct(input);
      navigate("/admin/products");
    } catch (err) {
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

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <AdminNav />
      <h1 className="mb-5 text-2xl font-bold">
        {isEdit ? "Edit product" : "New product"}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-6">
        {error && (
          <div className="alert-error">
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
          <span className="label">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input"
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
          <span className="label">Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input cursor-pointer"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={submitting} className="btn-primary px-6">
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
