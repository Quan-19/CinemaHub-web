// Showtimes.jsx - Main component đã được sửa
import { useState, useEffect } from "react";
import { Download, Eye, Printer, X } from "lucide-react";
import ShowtimesHeader from "../../components/admin/showtimes/ShowtimesHeader";
import ShowtimesStats from "../../components/admin/showtimes/ShowtimesStats";
import ShowtimesFilter from "../../components/admin/showtimes/ShowtimesFilter";
import ShowtimesTable from "../../components/admin/showtimes/ShowtimesTable";
import ShowtimeModal from "../../components/admin/showtimes/ShowtimeModal";
import ShowtimeDetailModal from "../../components/admin/showtimes/ShowtimeDetailModal";
import BulkActionBar from "../../components/admin/showtimes/BulkActionBar";
import CancelConfirmModal from "../../components/admin/showtimes/CancelConfirmModal";
import DeleteConfirmModal from "../../components/admin/showtimes/DeleteConfirmModal";
import { toast } from "react-hot-toast";
import {
  getTodayDate,
  getTomorrowDate,
  getWeekLaterDate,
  formatDateToDisplay,
  getTodayDisplay,
} from "../../utils/dateUtils";
import { useShowtimes, statusConfig, getStatusLabel, normalizeShowtimesData } from "./hooks/useShowtimes";

export default function ShowtimesPage() {
  const {
    showtimes,
    setShowtimes,
    movies,
    cinemas,
    loading,
    setLoading,
    dataLoading,
    lastRefreshTime,
    selectedShowtimes,
    setSelectedShowtimes,
    refreshData,
    cancelShowtime,
    deleteShowtime,
    bulkCancelShowtimes,
    bulkDeleteShowtimes,
  } = useShowtimes();

  // Local state
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const [specialFilter, setSpecialFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [form, setForm] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailShowtime, setSelectedDetailShowtime] = useState(null);
  
  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [bulkDeleteCount, setBulkDeleteCount] = useState(0);

  // Export states
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    document.title = "Quản lý suất chiếu | EbizCinema Admin";
  }, []);

  // Tính endTime với 10 phút quảng cáo
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "22:00";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes + 10;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    if (endHours >= 24) {
      const nextDayHours = endHours - 24;
      return `${String(nextDayHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")} (ngày hôm sau)`;
    }
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  const getMovieDuration = (movieId) => {
    const movie = movies.find((m) => m.id == movieId);
    return movie?.duration || 120;
  };

  const initNewForm = () => {
    setForm({
      movieId: "", movieTitle: "", movieDuration: null,
      cinemaId: "", cinemaName: "", roomId: "", roomName: "", type: "",
      date: getTodayDate(), time: "14:00", endTime: "",
      prices: { Thường: 0, VIP: 0, Couple: 0 },
      regularPrices: { Thường: 0, VIP: 0, Couple: 0 },
      specialPrices: null,
      isSpecial: false,
      specialPromotionId: null,
      specialPricingRuleId: null,
      totalSeats: 0, availableSeats: 0,
      status: "scheduled",
    });
  };

  const checkConflict = (newShowtime) => {
    const conflicts = showtimes.filter(
      (s) =>
        s.cinemaId == newShowtime.cinemaId &&
        s.roomId == newShowtime.roomId &&
        s.date === newShowtime.date &&
        s.id !== newShowtime.id &&
        s.status !== "cancelled"
    );

    for (let existing of conflicts) {
      const existingStart = new Date(`${existing.date}T${existing.time}`);
      const existingEnd = new Date(`${existing.date}T${existing.endTime?.split(" ")[0] || "23:59"}`);
      const newStart = new Date(`${newShowtime.date}T${newShowtime.time}`);
      const newEnd = new Date(`${newShowtime.date}T${newShowtime.endTime?.split(" ")[0] || "23:59"}`);

      if (newStart < existingEnd && newEnd > existingStart) {
        return { conflict: true, with: existing };
      }
    }
    return { conflict: false };
  };

  const handleAdd = () => {
    setEditingShowtime(null);
    initNewForm();
    setShowModal(true);
  };

  const handleEdit = (showtime) => {
    if (showtime.status === 'cancelled' || showtime.status === 'ended') {
      toast.error("Không thể chỉnh sửa suất chiếu đã kết thúc hoặc đã hủy");
      return;
    }
    setEditingShowtime(showtime);
    setForm(showtime);
    setShowModal(true);
  };

  const handleViewDetail = (showtime) => {
    setSelectedDetailShowtime(showtime);
    setShowDetailModal(true);
  };

  // Mở modal xác nhận hủy
  const openCancelModal = (showtime) => {
    console.log("🔍 Cancel modal - showtime status:", showtime.status, showtime);
    
    if (!showtime.status) {
      toast.error("Không thể xác định trạng thái của suất chiếu này.");
      return;
    }
    
    if (showtime.status !== 'scheduled') {
      const statusLabel = getStatusLabel(showtime.status);
      toast.error(`Chỉ có thể hủy suất chiếu đang ở trạng thái "Sắp chiếu". Hiện tại: ${statusLabel}`);
      return;
    }
    
    if ((showtime.bookedCount || 0) > 0) {
      toast.error(`Không thể hủy suất chiếu này vì đã có ${showtime.bookedCount} vé đã được đặt.`);
      return;
    }
    
    setCancelTarget(showtime);
    setCancelModalOpen(true);
  };

  // Mở modal xác nhận xóa (1 suất)
  const openDeleteModal = (showtime) => {
    console.log("🗑️ Delete modal - showtime status:", showtime.status, showtime);
    
    if (!showtime.status) {
      toast.error("Không thể xác định trạng thái của suất chiếu này.");
      return;
    }
    
    if (showtime.status === 'cancelled') {
      toast.error("Không thể xóa suất chiếu đã hủy");
      return;
    }
    
    if (showtime.status === 'ended') {
      toast.error("Không thể xóa suất chiếu đã kết thúc");
      return;
    }
    
    if ((showtime.bookedCount || 0) > 0) {
      toast.error(`Không thể xóa suất chiếu này vì đã có ${showtime.bookedCount} vé đã được đặt.`);
      return;
    }
    
    setDeleteTarget(showtime);
    setIsBulkDelete(false);
    setDeleteModalOpen(true);
  };

  // Mở modal xác nhận xóa hàng loạt
  const openBulkDeleteModal = () => {
    if (selectedShowtimes.length === 0) return;
    
    const selectedItems = showtimes.filter(s => selectedShowtimes.includes(s.id));
    
    const invalidStatusItems = selectedItems.filter(s => s.status === 'cancelled' || s.status === 'ended');
    if (invalidStatusItems.length > 0) {
      toast.error(`Không thể xóa ${invalidStatusItems.length} suất chiếu đã kết thúc hoặc đã hủy`);
      return;
    }
    
    const itemsWithBookings = selectedItems.filter(s => (s.bookedCount || 0) > 0);
    if (itemsWithBookings.length > 0) {
      toast.error(`Không thể xóa ${itemsWithBookings.length} suất chiếu đã có vé đặt.`);
      return;
    }
    
    setBulkDeleteCount(selectedShowtimes.length);
    setIsBulkDelete(true);
    setDeleteModalOpen(true);
  };

  // Xử lý hủy suất chiếu (có đóng modal)
  const handleCancelConfirm = async (id, movieTitle, showtime) => {
    await cancelShowtime(id, movieTitle, showtime, () => {
      // Callback đóng modal sau khi thành công
      setCancelModalOpen(false);
      setCancelTarget(null);
    });
  };

  // Xử lý xóa suất chiếu (có đóng modal)
  const handleDeleteConfirm = async (id, movieTitle) => {
    await deleteShowtime(id, movieTitle, () => {
      // Callback đóng modal sau khi thành công
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setIsBulkDelete(false);
      
      // Xóa khỏi danh sách đã chọn nếu có
      if (selectedShowtimes.includes(id)) {
        setSelectedShowtimes(prev => prev.filter(sid => sid !== id));
      }
    });
  };

  // Xử lý xóa hàng loạt
  const handleBulkDeleteConfirm = async () => {
    await bulkDeleteShowtimes(selectedShowtimes, () => {
      // Callback đóng modal sau khi thành công
      setDeleteModalOpen(false);
      setSelectedShowtimes([]);
      setIsBulkDelete(false);
      setBulkDeleteCount(0);
    });
  };

  // Xử lý hủy hàng loạt
  const handleBulkCancel = async () => {
    if (selectedShowtimes.length === 0) return;
    
    const selectedItems = showtimes.filter(s => selectedShowtimes.includes(s.id));
    
    const itemsWithBookings = selectedItems.filter(s => (s.bookedCount || 0) > 0);
    if (itemsWithBookings.length > 0) {
      toast.error(`Không thể hủy ${itemsWithBookings.length} suất chiếu đã có vé đặt.`);
      return;
    }
    
    const nonScheduledItems = selectedItems.filter(s => s.status !== 'scheduled');
    if (nonScheduledItems.length > 0) {
      toast.error(`Chỉ có thể hủy suất chiếu ở trạng thái 'Sắp chiếu'. Có ${nonScheduledItems.length} suất không phù hợp.`);
      return;
    }
    
    await bulkCancelShowtimes(selectedItems, () => {
      // Callback đóng các modal và clear selection
      setSelectedShowtimes([]);
    });
  };

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      const finalFormData = {
        ...formData,
        endTime: formData.endTime || calculateEndTime(formData.time, getMovieDuration(formData.movieId)),
      };

      const { conflict, with: conflictingShow } = checkConflict(finalFormData);
      if (conflict) {
        toast.error(`Xung đột lịch: Phòng đã có suất "${conflictingShow.movieTitle}" lúc ${conflictingShow.time}.`);
        return;
      }

      let cleanEndTime = finalFormData.endTime;
      if (cleanEndTime && cleanEndTime.includes("ngày hôm sau")) {
        cleanEndTime = cleanEndTime.replace(" (ngày hôm sau)", "");
      }
      if (!cleanEndTime || cleanEndTime === "---") {
        const duration = getMovieDuration(finalFormData.movieId);
        cleanEndTime = calculateEndTime(finalFormData.time, duration);
        if (cleanEndTime && cleanEndTime.includes("ngày hôm sau")) {
          cleanEndTime = cleanEndTime.replace(" (ngày hôm sau)", "");
        }
      }

      const payload = {
        movieId: Number(finalFormData.movieId),
        cinemaId: Number(finalFormData.cinemaId),
        roomId: Number(finalFormData.roomId),
        date: finalFormData.date,
        time: finalFormData.time,
        endTime: cleanEndTime,
        type: finalFormData.type,
        base_price: finalFormData.isSpecial
          ? finalFormData.specialPrices?.Thường || finalFormData.prices?.Thường || 90000
          : finalFormData.regularPrices?.Thường || finalFormData.prices?.Thường || 90000,
        regular_prices: finalFormData.regularPrices || finalFormData.prices,
        special_prices: finalFormData.isSpecial ? finalFormData.specialPrices || finalFormData.prices : null,
        special_pricing_rule_id: finalFormData.isSpecial ? finalFormData.specialPricingRuleId || null : null,
        prices: finalFormData.prices,
        is_special: Boolean(finalFormData.isSpecial),
        status: "scheduled",
      };

      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      let url = "http://localhost:5000/api/showtimes";
      let method = "POST";

      if (editingShowtime) {
        url = `http://localhost:5000/api/showtimes/${editingShowtime.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let result;
      try { result = JSON.parse(responseText); } catch (e) { result = { message: responseText }; }

      if (!response.ok) {
        throw new Error(result.error || result.message || "Lưu thất bại");
      }

      await refreshData();
      toast.success(editingShowtime ? "Cập nhật suất chiếu thành công!" : "Thêm suất chiếu thành công!");
      setShowModal(false);
      setEditingShowtime(null);
      initNewForm();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu!");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (filtered.length === 0) { toast.error("Không có dữ liệu để xuất!"); return; }
    setExporting(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reports/showtimes/export", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ showtimes: filtered, options: {} }),
      });
      if (!response.ok) throw new Error("Không thể xuất file Excel");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LichChieu_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      toast.error("Lỗi khi xuất file Excel!");
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (filtered.length === 0) { toast.error("Không có dữ liệu để xuất!"); return; }
    setExportingPDF(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reports/showtimes/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ showtimes: filtered, options: {} }),
      });
      if (!response.ok) throw new Error("Không thể tạo PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsPreviewOpen(true);
    } catch (error) {
      toast.error("Lỗi khi tạo báo cáo PDF!");
    } finally {
      setExportingPDF(false);
    }
  };

  const printSchedule = () => {
    if (filtered.length === 0) { toast.error("Không có dữ liệu để in!"); return; }
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>Lịch chiếu phim</title></head><body>...`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = (type) => {
    switch (type) {
      case "excel": exportToExcel(); break;
      case "pdf": exportToPDF(); break;
      case "print": printSchedule(); break;
      default: toast.success(`Đang xuất file ${type}...`);
    }
  };

  const filtered = showtimes.filter((s) => {
    const matchSearch = search === "" || s.movieTitle?.toLowerCase().includes(search.toLowerCase()) ||
      s.cinemaName?.toLowerCase().includes(search.toLowerCase()) || s.roomName?.toLowerCase().includes(search.toLowerCase());
    const matchCinema = cinemaFilter === "all" || s.cinemaId == cinemaFilter;
    const matchSpecial = specialFilter === "all" || (specialFilter === "special" && s.special);
    const today = getTodayDate(), tomorrow = getTomorrowDate(), weekLater = getWeekLaterDate();
    let matchDate = true;
    if (dateFilter === "today") matchDate = s.date === today;
    else if (dateFilter === "tomorrow") matchDate = s.date === tomorrow;
    else if (dateFilter === "week") matchDate = s.date >= today && s.date <= weekLater;
    else if (dateFilter !== "all") matchDate = s.date === dateFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchCinema && matchDate && matchStatus && matchSpecial;
  });

  const availableDates = [...new Set(showtimes.map((s) => s.date))].sort();

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-right text-xs text-gray-500">
        Cập nhật lần cuối: {lastRefreshTime.toLocaleTimeString()}
        <span className="ml-2 animate-pulse text-green-500">●</span>
      </div>

      <ShowtimesHeader
        total={showtimes.length}
        specialCount={showtimes.filter((s) => s.isSpecial || s.special).length}
        onAdd={handleAdd}
        onExport={handleExport}
        exporting={exporting}
        exportingPDF={exportingPDF}
      />

      <ShowtimesStats showtimes={showtimes} onDateChange={setDateFilter} />

      <ShowtimesFilter
        search={search} setSearch={setSearch}
        dateFilter={dateFilter} setDateFilter={setDateFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        cinemaFilter={cinemaFilter} setCinemaFilter={setCinemaFilter}
        availableDates={availableDates} cinemas={cinemas}
      />

      {selectedShowtimes.length > 0 && (
        <BulkActionBar
          count={selectedShowtimes.length}
          onClear={() => setSelectedShowtimes([])}
          onDelete={openBulkDeleteModal}
          onCancelBulk={handleBulkCancel}
        />
      )}

      <ShowtimesTable
        showtimes={filtered}
        onEdit={handleEdit}
        onDelete={openDeleteModal}
        onViewDetail={handleViewDetail}
        onCancel={openCancelModal}
        onSelect={setSelectedShowtimes}
        selectedIds={selectedShowtimes}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        loading={loading}
      />

      {showModal && (
        <ShowtimeModal
          show={showModal}
          onClose={() => { setShowModal(false); setEditingShowtime(null); initNewForm(); }}
          onSave={handleSave}
          form={form} setForm={setForm}
          isEdit={!!editingShowtime}
          movies={movies} cinemas={cinemas}
          loading={loading}
        />
      )}

      {/* Cancel Confirm Modal */}
      <CancelConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => { setCancelModalOpen(false); setCancelTarget(null); }}
        onConfirm={handleCancelConfirm}
        showtime={cancelTarget}
        loading={loading}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); setIsBulkDelete(false); }}
        onConfirm={isBulkDelete ? handleBulkDeleteConfirm : handleDeleteConfirm}
        showtime={deleteTarget}
        loading={loading}
        isBulk={isBulkDelete}
        bulkCount={bulkDeleteCount}
      />

      {/* PDF Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#121212] border border-white/10 w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Xem trước báo cáo</h3>
              <button onClick={() => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); setPdfUrl(null); setIsPreviewOpen(false); }}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1">
              {pdfUrl && <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />}
            </div>
          </div>
        </div>
      )}

      <ShowtimeDetailModal showtime={selectedDetailShowtime} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
    </div>
  );
}