import type { OrderStatus } from "../types";

// Each status → its own translucent colour, tuned for the dark theme.
const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  paid: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  completed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  cancelled: "bg-white/10 text-faint border-line",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
