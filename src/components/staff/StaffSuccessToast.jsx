export default function StaffSuccessToast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed right-4 top-4 z-[70]">
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-2xl shadow-black/30 backdrop-blur">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div>{message}</div>
      </div>
    </div>
  );
}
