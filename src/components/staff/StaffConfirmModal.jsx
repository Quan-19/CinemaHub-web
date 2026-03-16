import {
  StaffCenteredModalShell,
  StaffScrollableModalShell,
} from "./StaffModalShell.jsx";

export default function StaffConfirmModal({
  shell = "centered",
  title,
  headerTitle = "Xác nhận",
  onCancel,
  onConfirm,
  cancelLabel = "Hủy",
  confirmLabel = "Xóa",
  maxWidthClassName = "max-w-md",
  buttonRadiusClassName = "rounded-2xl",
  children,
}) {
  const Shell =
    shell === "scrollable"
      ? StaffScrollableModalShell
      : StaffCenteredModalShell;

  return (
    <Shell
      title={headerTitle}
      onClose={onCancel}
      maxWidthClassName={maxWidthClassName}
    >
      <div className="space-y-4">
        {children ? (
          children
        ) : (
          <p className="text-sm text-zinc-300">
            Bạn có chắc chắn muốn xóa{" "}
            <span className="font-semibold text-white">{title}</span>?
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={[
              "h-11 border border-zinc-800 bg-zinc-900/40 text-sm font-semibold text-zinc-200 hover:bg-zinc-900",
              buttonRadiusClassName,
            ].join(" ")}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "h-11 bg-cinema-primary text-sm font-semibold text-white hover:opacity-95",
              buttonRadiusClassName,
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Shell>
  );
}
