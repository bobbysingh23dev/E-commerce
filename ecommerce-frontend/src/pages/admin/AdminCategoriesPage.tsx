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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state. editingId === null means "create"; a number means "editing that one".
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    // Fetch the freshest copy (GET /categories/:id) before editing, in case
    // someone else changed it since the list was loaded.
    try {
      const fresh = await getCategory(category.id);
      setName(fresh.name);
      setDescription(fresh.description ?? "");
    } catch {
      // Fall back to the row data we already have.
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
      if (editingId !== null) {
        await updateCategory(editingId, input);
      } else {
        await createCategory(input);
      }
      await refresh();
      resetForm();
    } catch (err) {
      // e.g. 409 if the name already exists.
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <AdminNav />
      <h1 className="mb-4 text-2xl font-bold text-slate-900">
        Manage categories
      </h1>

      {/* Create / edit form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 max-w-lg space-y-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <p className="text-sm font-medium text-slate-700">
          {editingId !== null ? "Edit category" : "Add a category"}
        </p>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <TextField label="Name" value={name} onChange={setName} required />
        <TextField
          label="Description"
          value={description}
          onChange={setDescription}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting
              ? "Saving…"
              : editingId !== null
                ? "Save changes"
                : "Add category"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-slate-500">No categories yet.</p>
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{c.name}</p>
                {c.description && (
                  <p className="text-sm text-slate-500">{c.description}</p>
                )}
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => startEdit(c)}
                  className="text-slate-700 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-red-600 hover:underline"
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
