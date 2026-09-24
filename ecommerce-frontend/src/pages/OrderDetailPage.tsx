import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../api/orders";
import type { OrderDetail } from "../types";
import StatusBadge from "../components/StatusBadge";
import AnimatedPrice from "../components/AnimatedPrice";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getOrder(orderId)
      .then((data) => {
        if (!ignore) setOrder(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message ?? "Failed to load order");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [orderId]);

  async function handleCancel() {
    if (!order) return;
    if (!window.confirm(`Cancel order #${order.id}? This restocks the items.`))
      return;
    setCancelling(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, "cancelled");
      setOrder({ ...order, status: updated.status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't cancel order");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <p className="text-muted">Loading order…</p>;

  if (error && !order) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="alert-error">{error}</div>
        <Link to="/orders" className="mt-4 inline-block link-muted text-sm">
          ← Back to orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const canCancel = order.status === "pending" || order.status === "paid";

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/orders" className="mb-4 inline-block link-muted text-sm">
        ← Back to orders
      </Link>

      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mb-6 text-sm text-faint">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="card divide-y divide-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-fg">{item.product_name}</p>
              <p className="text-sm text-muted">
                {item.quantity} × ${item.unit_price}
              </p>
            </div>
            <span className="font-medium text-fg">
              ${(Number(item.unit_price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="card mt-4 flex items-center justify-between p-5">
        <span className="text-lg font-semibold text-muted">Total</span>
        <AnimatedPrice
          value={order.total}
          className="gradient-text font-display text-2xl font-bold"
        />
      </div>

      <div className="mt-6 flex gap-3">
        {order.status === "pending" && (
          <button
            onClick={() => navigate(`/pay/${order.id}`)}
            className="btn-primary px-6"
          >
            Pay now
          </button>
        )}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn-danger"
          >
            {cancelling ? "Cancelling…" : "Cancel order"}
          </button>
        )}
      </div>
    </div>
  );
}
