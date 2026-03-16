export default function StaffIconButton({
  label,
  onClick,
  children,
  variant = "ghost",
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition",
        variant === "danger"
          ? "border-zinc-800 bg-zinc-900/30 text-cinema-primary hover:bg-zinc-900"
          : "border-zinc-800 bg-zinc-900/30 text-zinc-200 hover:bg-zinc-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
