import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({ account, onClose, onConfirm }) {
  if (!account) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl w-[400px] p-6">
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-white font-semibold text-lg">Xác nhận xoá</h3>
        </div>

        <p className="text-white/70 text-sm mb-6">
          Bạn có chắc chắn muốn xoá tài khoản <span className="text-white font-medium">{account.name}</span>?
          Hành động này không thể hoàn tác.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg font-medium transition"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition"
          >
            Xoá tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}