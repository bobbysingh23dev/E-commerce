import { useEffect, useState } from "react";
import { getProducts, type SortColumn } from "../api/products";
import { getCategories } from "../api/categories";
import type { Product, Category, Pagination as PaginationInfo } from "../types";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";

const PAGE_SIZE = 9;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState<SortColumn>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    getProducts({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
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

  function backToFirstPage() {
    setPage(1);
  }

  return (
    <div>
      {/* ---- Hero ---- */}
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-line bg-surface/60 px-6 py-14 text-center sm:py-20">
        {/* soft inner glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_-10%,rgba(139,92,246,0.25),transparent_70%)]" />
        <div className="relative">
          <span className="chip mb-5">✦ New season, new arrivals</span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Discover things <br className="hidden sm:block" />
            you&apos;ll <span className="gradient-text">actually love</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            A hand-picked catalog with a checkout that just works. Search, sort,
            and fill your cart in seconds.
          </p>
        </div>
      </section>

      {/* ---- Control bar ---- */}
      <div className="card mb-6 flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1">
          <SearchIcon />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              backToFirstPage();
            }}
            placeholder="Search products…"
            className="input pl-10"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            backToFirstPage();
          }}
          className="input cursor-pointer sm:w-auto"
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
          className="input cursor-pointer sm:w-auto"
        >
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
          <option value="created_at">Sort: Newest</option>
        </select>

        <button
          onClick={() => {
            setOrder((o) => (o === "asc" ? "desc" : "asc"));
            backToFirstPage();
          }}
          className="btn-ghost sm:w-auto"
        >
          {order === "asc" ? "↑ Ascending" : "↓ Descending"}
        </button>
      </div>

      {/* ---- Results ---- */}
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="alert-error">
          <p className="font-medium">Couldn&apos;t load products</p>
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-muted">
          No products match your filters.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-faint">
            {pageInfo?.total} product{pageInfo?.total === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// A shimmering placeholder grid while products load — feels far more premium
// than a bare "Loading…" line.
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="h-40 animate-pulse bg-white/5" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
