import type { Product } from "../types";
import { useCart } from "../context/CartContext";

// Props are how a parent passes data INTO a component.
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const outOfStock = product.stock_quantity <= 0;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{product.name}</h3>
        {product.category_name && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {product.category_name}
          </span>
        )}
      </div>

      {product.description && (
        <p className="mt-1 text-sm text-slate-500">{product.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-lg font-bold text-slate-900">
          ${product.price}
        </span>
        {outOfStock ? (
          <span className="text-sm font-medium text-red-600">Out of stock</span>
        ) : (
          <span className="text-sm text-slate-500">
            {product.stock_quantity} in stock
          </span>
        )}
      </div>

      <button
        onClick={() => addItem(product)}
        disabled={outOfStock}
        className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {outOfStock ? "Unavailable" : "Add to cart"}
      </button>
    </div>
  );
}
