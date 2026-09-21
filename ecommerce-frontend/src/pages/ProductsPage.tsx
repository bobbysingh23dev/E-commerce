import { useEffect, useState } from "react";
import { getProducts, type SortColumn } from "../api/products";
import { getCategories } from "../api/categories";
import type { Product, Category, Pagination as PaginationInfo } from "../types";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";

const PAGE_SIZE = 9; // 3 x 3 grid on desktop

export default function ProductsPage() {
  // --- The "query": everything that shapes which products we ask for. ---
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400); // wait for typing to pause
  const [categoryId, setCategoryId] = useState(""); // "" = all categories
  const [sort, setSort] = useState<SortColumn>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // --- The data we get back. ---
  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Categories for the filter dropdown (fetched once on mount). ---
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([])); // dropdown just stays empty on failure
  }, []);

  // --- Fetch products whenever any part of the query changes. ---
  // The dependency array lists every query input, so React re-runs this the
  // moment the user searches, filters, sorts, or changes page.
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    getProducts({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined, // omit empty search
      category_id: categoryId ? Number(categoryId) : undefined,
      sort,
      order,
    })
      .then((res) => {
        if (ignore) return;
        setProducts(res.data);
        setPageInfo(res.pagination);
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
  }, [debouncedSearch, categoryId, sort, order, page]);

  // When a filter/sort changes, jump back to page 1 — otherwise you might be
  // on "page 5" of a result set that now only has 2 pages. (setPage(1) is a
  // no-op if we're already on page 1, so it won't cause an extra fetch.)
  function backToFirstPage() {
    setPage(1);
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Products</h1>

      {/* --- Toolbar --- */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            backToFirstPage();
          }}
          placeholder="Search by name…"
          className="w-full flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 sm:w-auto"
        />

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            backToFirstPage();
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortColumn);
            backToFirstPage();
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        >
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
          <option value="created_at">Sort: Date added</option>
        </select>

        <button
          onClick={() => {
            setOrder((o) => (o === "asc" ? "desc" : "asc"));
            backToFirstPage();
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {order === "asc" ? "↑ Ascending" : "↓ Descending"}
        </button>
      </div>

      {/* --- Results --- */}
      {loading ? (
        <p className="text-slate-500">Loading products…</p>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-medium">Couldn&apos;t load products</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-slate-500">No products match your filters.</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">
            {pageInfo?.total} product{pageInfo?.total === 1 ? "" : "s"} found
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={pageInfo?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
