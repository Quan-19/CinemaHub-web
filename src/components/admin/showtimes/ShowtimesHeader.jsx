import { Plus, Download, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ShowtimesHeader({ total, specialCount, onAdd, onExport }) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <CalendarIcon className="text-red-500" size={24} />
          Quản lý suất chiếu
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-white/40">
            Tổng: {total} suất chiếu • {new Date().toLocaleDateString('vi-VN')}
          </p>
          {specialCount > 0 && (
            <div className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
              <Sparkles size={12} />
              <span>{specialCount} suất đặc biệt</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Download size={16} />
            Xuất dữ liệu
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-10">
              <button
                onClick={() => {
                  onExport('excel');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                Xuất Excel
              </button>
              <button
                onClick={() => {
                  onExport('pdf');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                Xuất PDF
              </button>
              <button
                onClick={() => {
                  onExport('print');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                In lịch chiếu
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Thêm suất chiếu
        </button>
      </div>
    </div>
  );
}