import { X } from "lucide-react";

export function StaffCenteredModalShell({
  title,
  onClose,
  children,
  maxWidthClassName = "max-w-3xl",
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className={[
            "relative mx-auto flex min-h-0 w-full max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-cinema-surface shadow-2xl sm:max-h-[calc(100vh-3rem)]",
            maxWidthClassName,
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-700 px-4 py-3 sm:px-5">
            <div className="text-sm font-semibold text-white">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaffScrollableModalShell({
  title,
  onClose,
  children,
  maxWidthClassName = "max-w-2xl",
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 overflow-y-auto p-3 sm:p-5">
        <div
          className={[
            "mx-auto w-full rounded-2xl border border-zinc-700 bg-cinema-surface shadow-2xl",
            maxWidthClassName,
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-700 px-4 py-2.5 sm:px-5">
            <div className="text-sm font-semibold text-white">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 sm:p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
