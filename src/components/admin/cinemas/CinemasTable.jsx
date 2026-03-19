import { Pencil, Trash2, Eye } from "lucide-react";
import { useState } from "react";

export default function CinemasTable({
  cinemas,
  onEdit,
  onDelete,
  onAssign,
  onView,
  currentPage = 1,
  onPageChange,
  itemsPerPage = 5,
}) {
  const [viewingCinema, setViewingCinema] = useState(null);
  
  // Tính toán phân trang
  const totalPages = Math.ceil(cinemas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCinemas = cinemas.slice(startIndex, endIndex);

  const handleView = (cinema) => {
    setViewingCinema(cinema);
    if (onView) onView(cinema);
  };

  const closeViewModal = () => {
    setViewingCinema(null);
  };

  return (
    <>
      <div className="bg-[#0B1220] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-xs border-b border-white/5 bg-white/[0.02]">
            <tr>
              <th className="p-4 text-left">Tên rạp</th>
              <th className="text-left">Thương hiệu</th>
              <th className="text-left">Thành phố</th>
              <th className="text-left">Địa chỉ</th>
              <th className="text-center">Phòng chiếu</th>
              <th className="text-left">Trạng thái</th>
              <th className="text-left">Quản lý chi nhánh</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {currentCinemas.length > 0 ? (
              currentCinemas.map(c => (
                <tr
                  key={c.id}
                  className="h-[74px] border-b border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="p-4">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-white/30">{c.phone}</p>
                  </td>

                  <td>
                    <span className={`px-2.5 py-1 text-xs rounded-md ${brandColor(c.brand)}`}>
                      {c.brand}
                    </span>
                  </td>

                  <td className="text-white/70">{c.city}</td>

                  <td className="text-white/50 truncate max-w-[200px]">{c.address}</td>

                  <td className="text-center font-medium">{c.rooms}</td>

                  <td>
                    <span className={`px-3 py-1 text-xs rounded-full ${statusColor(c.status)}`}>
                      {c.status === "active" ? "Đang hoạt động" : "Bảo trì"}
                    </span>
                  </td>

                  <td>
                    {c.managerName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {c.managerName[0]}
                        </div>
                        <div>
                          <p className="text-sm">{c.managerName}</p>
                          {c.managerEmail && (
                            <p className="text-xs text-white/40">{c.managerEmail}</p>
                          )}
                          <p className="text-xs text-blue-400">
                            Quản lý chi nhánh
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAssign(c)}
                        className="text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-md text-xs hover:bg-yellow-500/10 transition"
                      >
                        🔑 Phân quyền
                      </button>
                    )}
                  </td>

                  <td>
                    <div className="flex justify-center gap-3">
                      <Eye 
                        size={18} 
                        className="text-blue-400 cursor-pointer hover:text-blue-300" 
                        onClick={() => handleView(c)}
                      />
                      <Pencil 
                        size={18} 
                        className="text-cyan-400 cursor-pointer hover:text-cyan-300" 
                        onClick={() => onEdit(c)} 
                      />
                      <Trash2 
                        size={18} 
                        className="text-red-500 cursor-pointer hover:text-red-400" 
                        onClick={() => onDelete(c.id)} 
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-white/40">
                  Không tìm thấy rạp nào
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PHÂN TRANG */}
        <div className="flex justify-between items-center px-4 py-3 text-xs text-white/40">
          <span>
            Hiển thị {startIndex + 1}-{Math.min(endIndex, cinemas.length)} / {cinemas.length} rạp
          </span>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded flex items-center justify-center ${
                currentPage === 1 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              ‹
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded flex items-center justify-center ${
                currentPage === totalPages 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      {viewingCinema && (
        <ViewCinemaModal cinema={viewingCinema} onClose={closeViewModal} />
      )}
    </>
  );
}

// MODAL XEM CHI TIẾT
function ViewCinemaModal({ cinema, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="w-[500px] bg-[#0B1220] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Chi tiết rạp</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Tên rạp" value={cinema.name} />
            <InfoItem label="Thương hiệu" value={cinema.brand} />
            <InfoItem label="Thành phố" value={cinema.city} />
            <InfoItem label="Số điện thoại" value={cinema.phone} />
            <InfoItem label="Số phòng chiếu" value={cinema.rooms} />
            <InfoItem 
              label="Trạng thái" 
              value={cinema.status === "active" ? "Đang hoạt động" : "Bảo trì"}
              status={cinema.status}
            />
          </div>
          
          <InfoItem label="Địa chỉ" value={cinema.address} fullWidth />
          
          <InfoItem 
            label="Quản lý" 
            value={cinema.managerName || "Chưa có quản lý"}
            fullWidth
          />
          
          {cinema.managerEmail && (
            <InfoItem label="Email quản lý" value={cinema.managerEmail} fullWidth />
          )}
          
          <InfoItem label="Số nhân viên" value={cinema.staffCount || 0} />
        </div>

        <div className="flex justify-end p-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, fullWidth, status }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      {status ? (
        <span className={`px-3 py-1 text-xs rounded-full ${statusColor(status)}`}>
          {value}
        </span>
      ) : (
        <p className="text-sm text-white">{value}</p>
      )}
    </div>
  );
}

function statusColor(status) {
  return status === "active"
    ? "bg-green-500/10 text-green-400"
    : "bg-yellow-500/10 text-yellow-400";
}

function brandColor(brand) {
  switch (brand) {
    case "CGV":
      return "bg-red-500/10 text-red-400";
    case "Lotte":
      return "bg-yellow-500/10 text-yellow-400";
    case "BHD":
      return "bg-purple-500/10 text-purple-400";
    case "Galaxy":
      return "bg-blue-500/10 text-blue-400";
    default:
      return "bg-white/10 text-white";
  }
}