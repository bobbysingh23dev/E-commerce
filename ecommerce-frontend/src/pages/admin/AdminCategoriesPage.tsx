import { useEffect, useState, type FormEvent } from "react";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import type { Category } from "../../types";
import { ApiError } from "../../api/client";
import AdminNav from "../../components/AdminNav";
import TextField from "../../components/TextField";
import { useToast } from "../../context/ToastContext";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  function refresh() {
    return getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message ?? "Failed to load categories"));
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setError(null);
  }

  async function startEdit(category: Category) {
    setEditingId(category.id);
    setError(null);
    try {
      const fresh = await getCategory(category.id);
      setName(fresh.name);
      setDescription(fresh.description ?? "");
    } catch {
      setName(category.name);
      setDescription(category.description ?? "");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input = {
      name: name.trim(),
      description: description.trim() === "" ? null : description.trim(),
    };
    try {
      if (editingId !== null) await updateCategory(editingId, input);
      else await createCategory(input);
      toast(editingId !== null ? "Category saved" : "Category added", "success");
      await refresh();
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      if (editingId === category.id) resetForm();
      toast(`Deleted "${category.name}"`, "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <AdminNav />
      <h1 className="mb-5 text-2xl font-bold">Manage categories</h1>

      <form onSubmit={handleSubmit} className="card mb-6 max-w-lg space-y-3 p-5">
        <p className="text-sm font-semibold text-muted">
          {editingId !== null ? "Edit category" : "Add a category"}
        </p>

        {error && <div className="alert-error">{error}</div>}

        <TextField label="Name" value={name} onChange={setName} required />
        <TextField
          label="Description"
          value={description}
          onChange={setDescription}
        />

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting
              ? "Saving…"
              : editingId !== null
                ? "Save changes"
                : "Add category"}
          </button>
          {editingId !== null && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-muted">No categories yet.</p>
      ) : (
        <div className="card divide-y divide-line">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-fg">{c.name}</p>
                {c.description && (
                  <p className="text-sm text-muted">{c.description}</p>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => startEdit(c)}
                  className="text-accent-3 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
