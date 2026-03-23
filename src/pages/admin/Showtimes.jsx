import { useState, useEffect } from "react";
import ShowtimesHeader from "../../components/admin/showtimes/ShowtimesHeader";
import ShowtimesStats from "../../components/admin/showtimes/ShowtimesStats";
import ShowtimesFilter from "../../components/admin/showtimes/ShowtimesFilter";
import ShowtimesTable from "../../components/admin/showtimes/ShowtimesTable";
import ShowtimeModal from "../../components/admin/showtimes/ShowtimeModal";
import BulkActionBar from "../../components/admin/showtimes/BulkActionBar";
import QuickEditModal from "../../components/admin/showtimes/QuickEditModal";
import { toast } from "react-hot-toast";

// Giá vé CGV và Galaxy Cinema thực tế (2024)
export const PRICE_CONFIG = {
  // Giá vé cơ bản theo ngày thường
  standard: {
    "2D": {
      adult: 90000,
      child: 70000,
      student: 75000,
      vip: 120000,
    },
    "3D": {
      adult: 110000,
      child: 90000,
      student: 95000,
      vip: 150000,
    },
    IMAX: {
      adult: 150000,
      child: 130000,
      student: 135000,
      vip: 200000,
    },
    "4DX": {
      adult: 180000,
      child: 160000,
      student: 165000,
      vip: 240000,
    },
  },

  // Giá vé cuối tuần (Thứ 6,7,CN)
  weekend: {
    "2D": {
      adult: 100000,
      child: 80000,
      student: 85000,
      vip: 140000,
    },
    "3D": {
      adult: 120000,
      child: 100000,
      student: 105000,
      vip: 170000,
    },
    IMAX: {
      adult: 170000,
      child: 150000,
      student: 155000,
      vip: 230000,
    },
    "4DX": {
      adult: 200000,
      child: 180000,
      student: 185000,
      vip: 270000,
    },
  },

  // Giá vé khung giờ sáng sớm
  early: {
    "2D": {
      adult: 65000,
      child: 50000,
      student: 55000,
      vip: 90000,
    },
    "3D": {
      adult: 85000,
      child: 70000,
      student: 75000,
      vip: 120000,
    },
  },

  // Giá vé khuya
  midnight: {
    "2D": {
      adult: 75000,
      child: 60000,
      student: 65000,
      vip: 100000,
    },
    "3D": {
      adult: 95000,
      child: 80000,
      student: 85000,
      vip: 130000,
    },
  },
};

// Định nghĩa các loại suất chiếu đặc biệt với giá thực tế
export const SPECIAL_TYPES = [
  {
    value: "premiere",
    label: "Suất chiếu ra mắt",
    color: "#e50914",
    icon: "🎬",
    description: "Suất chiếu sớm trước ngày công chiếu chính thức",
    priceMultiplier: 1.3,
    availableFormats: ["2D", "IMAX", "4DX"],
  },
  {
    value: "holiday",
    label: "Suất chiếu ngày lễ",
    color: "#f59e0b",
    icon: "🎉",
    description: "Áp dụng cho các ngày lễ, Tết",
    priceMultiplier: 1.2,
    availableFormats: ["2D", "3D", "IMAX", "4DX"],
  },
  {
    value: "event",
    label: "Suất chiếu sự kiện",
    color: "#8b5cf6",
    icon: "🎪",
    description: "Suất chiếu đặc biệt có giao lưu, quà tặng",
    priceMultiplier: 1.5,
    availableFormats: ["2D", "IMAX"],
  },
  {
    value: "midnight",
    label: "Suất chiếu đêm",
    color: "#3b82f6",
    icon: "🌙",
    description: "Suất chiếu sau 23:00",
    priceMultiplier: 0.8,
    availableFormats: ["2D", "3D"],
  },
  {
    value: "vip",
    label: "Suất chiếu VIP",
    color: "#f43f5e",
    icon: "👑",
    description: "Ghế ngồi VIP, đồ uống miễn phí",
    priceMultiplier: 2.0,
    availableFormats: ["2D", "IMAX"],
  },
  {
    value: "couple",
    label: "Suất chiếu đôi",
    color: "#ec4899",
    icon: "💑",
    description: "Ghế đôi dành cho các cặp đôi",
    priceMultiplier: 1.8,
    availableFormats: ["2D"],
  },
  {
    value: "early",
    label: "Suất chiếu sớm",
    color: "#10b981",
    icon: "🌅",
    description: "Suất chiếu trước 12:00 trưa",
    priceMultiplier: 0.7,
    availableFormats: ["2D", "3D"],
  },
  {
    value: "sweetbox",
    label: "Sweetbox",
    color: "#f97316",
    icon: "🍿",
    description: "Combo vé + bỏng nước",
    priceMultiplier: 1.4,
    availableFormats: ["2D"],
  },
];

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const [specialFilter, setSpecialFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [selectedShowtimes, setSelectedShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  const itemsPerPage = 10;

  // Hàm xác định giá vé dựa trên ngày và giờ
  const getBasePriceByTime = (date, time, type) => {
    const showDate = new Date(date);
    const dayOfWeek = showDate.getDay();
    const hour = parseInt(time.split(":")[0]);

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;

    if (hour < 12) {
      return PRICE_CONFIG.early?.[type] || PRICE_CONFIG.standard[type];
    } else if (hour >= 23) {
      return PRICE_CONFIG.midnight?.[type] || PRICE_CONFIG.standard[type];
    } else if (isWeekend) {
      return PRICE_CONFIG.weekend[type] || PRICE_CONFIG.standard[type];
    } else {
      return PRICE_CONFIG.standard[type] || PRICE_CONFIG.standard["2D"];
    }
  };

  // Tính giá vé dựa trên loại suất chiếu đặc biệt
  const calculateSpecialPrice = (basePrice, specialType, format) => {
    const special = SPECIAL_TYPES.find((t) => t.value === specialType);
    if (!special) return basePrice;

    if (!special.availableFormats.includes(format)) {
      return basePrice;
    }

    return {
      adult:
        Math.round((basePrice.adult * special.priceMultiplier) / 1000) * 1000,
      child:
        Math.round((basePrice.child * special.priceMultiplier) / 1000) * 1000,
      student:
        Math.round((basePrice.student * special.priceMultiplier) / 1000) * 1000,
      vip: Math.round((basePrice.vip * special.priceMultiplier) / 1000) * 1000,
    };
  };

  // Lọc dữ liệu
  const filtered = showtimes.filter((s) => {
    const matchSearch =
      search === "" ||
      s.movieTitle?.toLowerCase().includes(search.toLowerCase()) ||
      s.cinemaName?.toLowerCase().includes(search.toLowerCase()) ||
      s.roomName?.toLowerCase().includes(search.toLowerCase());

    const matchCinema = cinemaFilter === "all" || s.cinemaId === cinemaFilter;

    const matchSpecial =
      specialFilter === "all" ||
      (specialFilter === "special" && s.special) ||
      (specialFilter !== "special" && s.specialType === specialFilter);

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const weekLater = new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split("T")[0];

    let matchDate = true;
    if (dateFilter === "today") {
      matchDate = s.date === today;
    } else if (dateFilter === "tomorrow") {
      matchDate = s.date === tomorrow;
    } else if (dateFilter === "week") {
      matchDate = s.date >= today && s.date <= weekLater;
    } else if (dateFilter !== "all") {
      matchDate = s.date === dateFilter;
    }

    const matchStatus = statusFilter === "all" || s.status === statusFilter;

    return (
      matchSearch && matchCinema && matchDate && matchStatus && matchSpecial
    );
  });

  // Tự động cập nhật trạng thái suất chiếu
  useEffect(() => {
    const interval = setInterval(() => {
      setShowtimes((prev) =>
        prev.map((showtime) => {
          const now = new Date();
          const showDate = new Date(`${showtime.date}T${showtime.time}`);
          const endDate = new Date(
            `${showtime.date}T${showtime.endTime || addHours(showtime.time, 2)}`
          );

          let newStatus = showtime.status;
          if (showtime.status !== "cancelled") {
            if (now > endDate) {
              newStatus = "ended";
            } else if (now >= showDate && now <= endDate) {
              newStatus = "ongoing";
            } else if (now < showDate) {
              newStatus = "scheduled";
            }
          }

          return { ...showtime, status: newStatus };
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const addHours = (time, hours) => {
    const [h, m] = time.split(":").map(Number);
    return `${String(h + hours).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}`;
  };

  // Tính end time dựa trên thời lượng phim
  const calculateEndTime = (movieId, startTime, movieDuration) => {
    if (!movieDuration) return addHours(startTime, 2);

    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + movieDuration + 15;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
      2,
      "0"
    )}`;
  };

  // Kiểm tra xung đột lịch chiếu
  const checkConflict = (newShowtime) => {
    const conflicts = showtimes.filter(
      (s) =>
        s.cinemaId === newShowtime.cinemaId &&
        s.roomId === newShowtime.roomId &&
        s.date === newShowtime.date &&
        s.id !== newShowtime.id &&
        s.status !== "cancelled"
    );

    for (let existing of conflicts) {
      const existingStart = new Date(`${existing.date}T${existing.time}`);
      const existingEnd = new Date(
        `${existing.date}T${existing.endTime || addHours(existing.time, 2)}`
      );
      const newStart = new Date(`${newShowtime.date}T${newShowtime.time}`);
      const newEnd = new Date(
        `${newShowtime.date}T${
          newShowtime.endTime || addHours(newShowtime.time, 2)
        }`
      );

      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          conflict: true,
          with: existing,
        };
      }
    }

    return { conflict: false };
  };

  const handleAdd = () => {
    setEditingShowtime(null);
    setForm(null);
    setShowModal(true);
  };

  const handleEdit = (showtime) => {
    setEditingShowtime(showtime);
    setForm(showtime);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    setLoading(true);

    try {
      const basePrice = getBasePriceByTime(
        formData.date,
        formData.time,
        formData.type
      );

      let finalPrice = basePrice;
      if (formData.special && formData.specialType) {
        finalPrice = calculateSpecialPrice(
          basePrice,
          formData.specialType,
          formData.type
        );
      }

      const endTime = calculateEndTime(
        formData.movieId,
        formData.time,
        formData.movieDuration
      );
      const formWithEndTime = {
        ...formData,
        endTime,
        price: finalPrice,
      };

      const { conflict, with: conflictingShow } =
        checkConflict(formWithEndTime);

      if (conflict) {
        const confirm = window.confirm(
          `Suất chiếu này xung đột với "${conflictingShow.movieTitle}" lúc ${conflictingShow.time}. Bạn có muốn tiếp tục?`
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      // Gọi API để lưu
      if (editingShowtime) {
        // Cập nhật
        setShowtimes((prev) =>
          prev.map((s) =>
            s.id === editingShowtime.id ? { ...s, ...formWithEndTime } : s
          )
        );
        toast.success("Cập nhật suất chiếu thành công!");
      } else {
        // Thêm mới
        const newShowtime = {
          id: `ST${Date.now()}`,
          ...formWithEndTime,
          availableSeats: formWithEndTime.totalSeats,
          bookedCount: 0,
          revenue: 0,
          status: "scheduled",
        };
        setShowtimes((prev) => [newShowtime, ...prev]);
        toast.success("Thêm suất chiếu thành công!");
      }

      setShowModal(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
      setLoading(true);
      try {
        // Gọi API xóa
        setShowtimes((prev) => prev.filter((s) => s.id !== id));
        toast.success("Xóa suất chiếu thành công!");
      } catch (error) {
        toast.error("Có lỗi xảy ra!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopy = async (showtime) => {
    const newShowtime = {
      ...showtime,
      id: `ST${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      status: "scheduled",
      bookedCount: 0,
      revenue: 0,
      availableSeats: showtime.totalSeats,
    };

    setShowtimes((prev) => [newShowtime, ...prev]);
    toast.success("Đã nhân bản suất chiếu!");
  };

  const handleBulkDelete = async () => {
    if (selectedShowtimes.length === 0) return;

    const confirm = window.confirm(
      `Bạn có chắc muốn xóa ${selectedShowtimes.length} suất chiếu?`
    );
    if (!confirm) return;

    setLoading(true);
    try {
      // Gọi API xóa hàng loạt
      setShowtimes((prev) =>
        prev.filter((s) => !selectedShowtimes.includes(s.id))
      );
      setSelectedShowtimes([]);
      toast.success(`Đã xóa ${selectedShowtimes.length} suất chiếu`);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedShowtimes.length === 0) return;

    setLoading(true);
    try {
      // Gọi API cập nhật trạng thái hàng loạt
      setShowtimes((prev) =>
        prev.map((s) =>
          selectedShowtimes.includes(s.id) ? { ...s, status: newStatus } : s
        )
      );
      setSelectedShowtimes([]);
      toast.success(
        `Đã cập nhật trạng thái ${selectedShowtimes.length} suất chiếu`
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSpecialChange = async (specialType) => {
    if (selectedShowtimes.length === 0) return;

    setLoading(true);
    try {
      setShowtimes((prev) =>
        prev.map((s) => {
          if (selectedShowtimes.includes(s.id)) {
            const newSpecial = specialType !== "none";

            const basePrice = getBasePriceByTime(s.date, s.time, s.type);
            const newPrice = newSpecial
              ? calculateSpecialPrice(basePrice, specialType, s.type)
              : basePrice;

            return {
              ...s,
              special: newSpecial,
              specialType: newSpecial ? specialType : null,
              price: newPrice,
            };
          }
          return s;
        })
      );
      setSelectedShowtimes([]);
      toast.success(
        `Đã cập nhật loại suất chiếu cho ${selectedShowtimes.length} suất`
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    switch (type) {
      case "excel":
        exportToExcel();
        break;
      case "pdf":
        exportToPDF();
        break;
      case "print":
        printSchedule();
        break;
      default:
        toast.success(`Đang xuất file ${type}...`);
    }
  };

  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast.error("Không có dữ liệu để xuất!");
      return;
    }

    const exportData = filtered.map((s) => {
      const specialType = SPECIAL_TYPES.find((t) => t.value === s.specialType);
      return {
        "Tên phim": s.movieTitle,
        Rạp: s.cinemaName,
        Phòng: s.roomName,
        Ngày: s.date,
        Giờ: s.time,
        "Định dạng": s.type,
        "Loại suất": s.special ? specialType?.label || "Đặc biệt" : "Thường",
        "Ghế trống": `${s.availableSeats}/${s.totalSeats}`,
        "Giá vé (người lớn)": `${s.price?.adult?.toLocaleString()}đ`,
        "Giá vé (trẻ em)": `${s.price?.child?.toLocaleString()}đ`,
        "Giá vé (sinh viên)": `${s.price?.student?.toLocaleString()}đ`,
        "Giá vé (VIP)": `${s.price?.vip?.toLocaleString()}đ`,
        "Trạng thái": statusConfig[s.status]?.label || s.status,
        "Đã bán": s.bookedCount,
        "Doanh thu": `${s.revenue?.toLocaleString()}đ`,
      };
    });

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `suat-chieu-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Xuất file Excel thành công!");
  };

  const exportToPDF = () => {
    window.print();
    toast.success("Đã mở trang in, bạn có thể lưu dưới dạng PDF");
  };

  const printSchedule = () => {
    if (filtered.length === 0) {
      toast.error("Không có dữ liệu để in!");
      return;
    }

    const printWindow = window.open("", "_blank");
    const today = new Date().toLocaleDateString("vi-VN");

    printWindow.document.write(`
      <html>
        <head>
          <title>Lịch chiếu phim - ${today}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #e50914; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f5f5f5; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .special-badge { 
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
            }
            .price { color: #f59e0b; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>LỊCH CHIẾU PHIM - ${today}</h1>
          <p>Tổng số: ${filtered.length} suất chiếu</p>
          <p>Suất đặc biệt: ${filtered.filter((s) => s.special).length} suất</p>
          <table>
            <thead>
              <tr>
                <th>Phim</th>
                <th>Rạp</th>
                <th>Phòng</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Loại</th>
                <th>Suất</th>
                <th>Ghế</th>
                <th>Giá vé</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map((s) => {
                  const specialType = SPECIAL_TYPES.find(
                    (t) => t.value === s.specialType
                  );
                  return `
                  <tr>
                    <td><strong>${s.movieTitle}</strong></td>
                    <td>${s.cinemaName}</td>
                    <td>${s.roomName}</td>
                    <td>${new Date(s.date).toLocaleDateString("vi-VN")}</td>
                    <td>${s.time}</td>
                    <td>${s.type}</td>
                    <td>
                      ${
                        s.special
                          ? `<span class="special-badge" style="background: ${specialType?.color}20; color: ${specialType?.color}">${specialType?.icon} ${specialType?.label}</span>`
                          : "Thường"
                      }
                    </td>
                    <td>${s.availableSeats}/${s.totalSeats}</td>
                    <td class="price">${s.price?.adult?.toLocaleString()}đ</td>
                    <td>${statusConfig[s.status]?.label || s.status}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Lấy danh sách ngày có suất chiếu
  const availableDates = [...new Set(showtimes.map((s) => s.date))].sort();

  // Hàm cập nhật form khi chọn phim/rạp/phòng
  const updateFormFromSelection = (updates) => {
    setForm((prev) => {
      const newForm = { ...prev, ...updates };

      if (updates.movieId && updates.movieDuration) {
        newForm.endTime = calculateEndTime(
          updates.movieId,
          newForm.time,
          updates.movieDuration
        );
      }

      if (updates.cinemaId || updates.roomId) {
        const cinema = cinemas.find((c) => c.id === newForm.cinemaId);
        if (cinema) {
          const room =
            cinema.rooms?.find((r) => r.id === newForm.roomId) ||
            cinema.rooms?.[0];
          if (room) {
            newForm.roomName = room.name;
            newForm.type = room.type;
            newForm.totalSeats = room.capacity;
            newForm.availableSeats = room.capacity;
          }
        }
      }

      if (updates.specialType !== undefined) {
        newForm.special = updates.specialType !== "none";
        const basePrice = getBasePriceByTime(
          newForm.date,
          newForm.time,
          newForm.type
        );
        if (newForm.special) {
          newForm.price = calculateSpecialPrice(
            basePrice,
            updates.specialType,
            newForm.type
          );
        } else {
          newForm.price = basePrice;
        }
      }

      if (updates.date || updates.time) {
        const basePrice = getBasePriceByTime(
          newForm.date,
          newForm.time,
          newForm.type
        );
        if (newForm.special && newForm.specialType) {
          newForm.price = calculateSpecialPrice(
            basePrice,
            newForm.specialType,
            newForm.type
          );
        } else {
          newForm.price = basePrice;
        }
      }

      return newForm;
    });
  };

  return (
    <div className="p-6 space-y-5">
      <ShowtimesHeader
        total={showtimes.length}
        specialCount={showtimes.filter((s) => s.special).length}
        onAdd={handleAdd}
        onExport={handleExport}
      />

      <ShowtimesStats
        showtimes={showtimes}
        onDateChange={setDateFilter}
        specialTypes={SPECIAL_TYPES}
      />

      <ShowtimesFilter
        search={search}
        setSearch={setSearch}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        cinemaFilter={cinemaFilter}
        setCinemaFilter={setCinemaFilter}
        specialFilter={specialFilter}
        setSpecialFilter={setSpecialFilter}
        availableDates={availableDates}
        cinemas={cinemas}
        specialTypes={SPECIAL_TYPES}
      />

      {selectedShowtimes.length > 0 && (
        <BulkActionBar
          count={selectedShowtimes.length}
          onClear={() => setSelectedShowtimes([])}
          onDelete={handleBulkDelete}
          onStatusChange={handleBulkStatusChange}
          onSpecialChange={handleBulkSpecialChange}
          onQuickEdit={() => setShowQuickEdit(true)}
          specialTypes={SPECIAL_TYPES}
        />
      )}

      <ShowtimesTable
        showtimes={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onQuickEdit={(showtime) => {
          setEditingShowtime(showtime);
          setShowQuickEdit(true);
        }}
        onSelect={(selectedIds) => setSelectedShowtimes(selectedIds)}
        selectedIds={selectedShowtimes}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        loading={loading}
        specialTypes={SPECIAL_TYPES}
      />

      {showModal && (
        <ShowtimeModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          form={form}
          setForm={updateFormFromSelection}
          isEdit={!!editingShowtime}
          movies={movies}
          cinemas={cinemas}
          loading={loading}
          specialTypes={SPECIAL_TYPES}
          priceConfig={PRICE_CONFIG}
        />
      )}

      <QuickEditModal
        show={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        showtimes={showtimes.filter((s) => selectedShowtimes.includes(s.id))}
        onSave={async (updates) => {
          setLoading(true);
          try {
            setShowtimes((prev) =>
              prev.map((s) =>
                selectedShowtimes.includes(s.id) ? { ...s, ...updates } : s
              )
            );
            setSelectedShowtimes([]);
            setShowQuickEdit(false);
            toast.success("Cập nhật thành công!");
          } catch (error) {
            toast.error("Có lỗi xảy ra!");
          } finally {
            setLoading(false);
          }
        }}
        loading={loading}
        specialTypes={SPECIAL_TYPES}
      />
    </div>
  );
}

export const statusConfig = {
  scheduled: {
    label: "Sắp chiếu",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
  ongoing: {
    label: "Đang chiếu",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  ended: {
    label: "Đã kết thúc",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
  },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};
