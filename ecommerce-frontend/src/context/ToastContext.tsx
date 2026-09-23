import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}
interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, kind }]);
    // Auto-dismiss after a moment.
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      2600,
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const style = {
    success: "border-emerald-400/30 text-emerald-200",
    error: "border-red-400/30 text-red-200",
    info: "border-line text-fg",
  }[toast.kind];
  const icon = { success: "✓", error: "!", info: "✦" }[toast.kind];

  return (
    <div
      className={`toast-in glass flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] ${style}`}
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-xs">
        {icon}
      </span>
      {toast.message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}
