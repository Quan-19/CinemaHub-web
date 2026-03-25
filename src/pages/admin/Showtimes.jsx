// Showtimes.jsx - Complete corrected file
import { useState, useEffect } from "react";
import ShowtimesHeader from "../../components/admin/showtimes/ShowtimesHeader";
import ShowtimesStats from "../../components/admin/showtimes/ShowtimesStats";
import ShowtimesFilter from "../../components/admin/showtimes/ShowtimesFilter";
import ShowtimesTable from "../../components/admin/showtimes/ShowtimesTable";
import ShowtimeModal from "../../components/admin/showtimes/ShowtimeModal";
import BulkActionBar from "../../components/admin/showtimes/BulkActionBar";
import QuickEditModal from "../../components/admin/showtimes/QuickEditModal";
import { toast } from "react-hot-toast";

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

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
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
  const [dataLoading, setDataLoading] = useState(true);

  const itemsPerPage = 10;

  // Hàm xác định khung giờ
  const getTimeSlot = (time) => {
    if (!time) return "Chiều (12h-18h)";
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return "Sáng (trước 12h)";
    if (hour >= 18) return "Tối (sau 18h)";
    return "Chiều (12h-18h)";
  };

  // Hàm xác định loại ngày
  const getDayType = (date) => {
    if (!date) return "Ngày thường";
    const showDate = new Date(date);
    const dayOfWeek = showDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return "Cuối tuần";
    return "Ngày thường";
  };

  // Lấy giá cho từng loại ghế từ pricing_rules
  const getPricesBySeatType = (date, time, type) => {
    if (!pricingRules.length) {
      console.warn("No pricing rules found");
      return null;
    }

    const timeSlot = getTimeSlot(time);
    const dayType = getDayType(date);
    
    const seatTypes = ["Thường", "VIP", "Couple"];
    const prices = {};
    
    for (const seat of seatTypes) {
      const matchingRule = pricingRules.find(rule => 
        rule.type === type &&
        rule.seat === seat &&
        rule.day === dayType &&
        rule.time === timeSlot &&
        rule.active === true
      );
      
      if (matchingRule) {
        prices[seat] = matchingRule.final;
      } else {
        const fallbackRule = pricingRules.find(rule => 
          rule.type === type &&
          rule.seat === seat &&
          rule.active === true
        );
        prices[seat] = fallbackRule ? fallbackRule.final : 0;
      }
    }
    
    return prices;
  };

  // Load tất cả dữ liệu từ localStorage
  useEffect(() => {
    const loadData = () => {
      setDataLoading(true);
      try {
        // Load movies
        const savedMovies = localStorage.getItem("movies");
        if (savedMovies) {
          setMovies(JSON.parse(savedMovies));
        } else {
          setMovies([]);
        }
        
        const savedCinemas = localStorage.getItem('cinemas');
        if (savedCinemas) {
          const cinemaData = JSON.parse(savedCinemas);
          const normalizedCinemas = cinemaData.map(cinema => ({
            ...cinema,
            id: cinema.id,
            name: cinema.name,
            rooms: cinema.rooms || [],
            currentRooms: cinema.currentRooms || cinema.rooms?.length || 0,
            maxRooms: cinema.maxRooms || 4,
          }));
          setCinemas(normalizedCinemas);
        } else {
          setCinemas([]);
        }
        
        const savedPricingRules = localStorage.getItem('pricing_rules');
        if (savedPricingRules) {
          const rules = JSON.parse(savedPricingRules);
          setPricingRules(rules);
          console.log("Loaded pricing rules:", rules.length);
        } else {
          console.warn("No pricing rules found in localStorage");
          setPricingRules([]);
        }
        
        const savedShowtimes = localStorage.getItem('showtimes');
        if (savedShowtimes) {
          setShowtimes(JSON.parse(savedShowtimes));
        } else {
          setShowtimes([]);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Lỗi tải dữ liệu!");
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  // Save showtimes to localStorage
  useEffect(() => {
    if (!dataLoading) {
      localStorage.setItem("showtimes", JSON.stringify(showtimes));
    }
  }, [showtimes, dataLoading]);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "movies") {
        try {
          setMovies(JSON.parse(e.newValue) || []);
        } catch (error) {
          console.error("Failed to parse movies:", error);
        }
      }
      if (e.key === "cinemas") {
        try {
          const cinemaData = JSON.parse(e.newValue) || [];
          const normalizedCinemas = cinemaData.map((cinema) => ({
            ...cinema,
            rooms: cinema.rooms || [],
            currentRooms: cinema.currentRooms || cinema.rooms?.length || 0,
            maxRooms: cinema.maxRooms || 4,
          }));
          setCinemas(normalizedCinemas);
        } catch (error) {
          console.error("Failed to parse cinemas:", error);
        }
      }
      if (e.key === "showtimes") {
        try {
          setShowtimes(JSON.parse(e.newValue) || []);
        } catch (error) {
          console.error("Failed to parse showtimes:", error);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getBasePriceByTime = (date, time, type) => {
    if (!date || !time || !type) return PRICE_CONFIG.standard["2D"];

    const showDate = new Date(date);
    const dayOfWeek = showDate.getDay();
    const hour = parseInt(time.split(":")[0]);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;

    if (hour < 12) {
      return (
        PRICE_CONFIG.early?.[type] ||
        PRICE_CONFIG.standard[type] ||
        PRICE_CONFIG.standard["2D"]
      );
    } else if (hour >= 23) {
      return (
        PRICE_CONFIG.midnight?.[type] ||
        PRICE_CONFIG.standard[type] ||
        PRICE_CONFIG.standard["2D"]
      );
    } else if (isWeekend) {
      return (
        PRICE_CONFIG.weekend[type] ||
        PRICE_CONFIG.standard[type] ||
        PRICE_CONFIG.standard["2D"]
      );
    } else {
      return PRICE_CONFIG.standard[type] || PRICE_CONFIG.standard["2D"];
    }
  };

  const calculateSpecialPrice = (basePrice, specialType, format) => {
    const special = SPECIAL_TYPES.find((t) => t.value === specialType);
    if (!special) return basePrice;
    if (!special.availableFormats.includes(format)) return basePrice;

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

  const addHours = (time, hours) => {
    if (!time) return "22:00";
    const [h, m] = time.split(":").map(Number);
    return `${String(h + hours).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}`;
  };

  // Hàm tính giờ kết thúc - xử lý đúng khi vượt quá 24h
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes)
      return addHours(startTime || "00:00", 2);
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes + 15;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
      2,
      "0"
    )}`;
  };

  // Hàm tính giờ kết thúc cho hiển thị trong bảng (format ngắn gọn)
  const formatEndTimeDisplay = (endTime) => {
    if (!endTime) return "---";
    // Nếu có (ngày hôm sau) thì giữ nguyên
    if (endTime.includes('ngày hôm sau')) return endTime;
    return endTime;
  };

  // Hàm tính giờ kết thúc thuần (không có text) để lưu vào data
  const calculateRawEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return addHours(startTime || "00:00", 2);
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes + 15;
    
    const endHours = totalMinutes / 60;
    const endMinutes = totalMinutes % 60;
    
    // Trả về object chứa giờ và thông tin ngày hôm sau
    return {
      time: `${String(Math.floor(endHours) % 24).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
      isNextDay: endHours >= 24
    };
  };

  const getMovieDuration = (movieId) => {
    const movie = movies.find((m) => m.id === movieId);
    return movie?.duration || 120;
  };

  const initNewForm = () => {
    setForm({
      movieId: "",
      movieTitle: "",
      cinemaId: "",
      cinemaName: "",
      roomId: "",
      roomName: "",
      type: "",
      date: new Date().toISOString().split("T")[0],
      time: "14:00",
      endTime: "16:00",
      prices: {
        Thường: 0,
        VIP: 0,
        Couple: 0
      },
      totalSeats: 0,
      availableSeats: 0,
      status: "scheduled",
    });
  };

  const updateForm = (updates) => {
    setForm((prev) => {
      const newForm = { ...prev, ...updates };

      // Khi chọn cinema, cập nhật danh sách phòng và chọn phòng đầu tiên
      if (
        updates.cinemaId !== undefined &&
        updates.cinemaId !== prev.cinemaId
      ) {
        const cinema = cinemas.find((c) => c.id == updates.cinemaId);
        if (cinema) {
          newForm.cinemaName = cinema.name;
          const rooms = cinema.rooms || [];

          if (rooms.length > 0) {
            const firstRoom = rooms[0];
            newForm.roomId = firstRoom.id;
            newForm.roomName = firstRoom.name;
            newForm.type = firstRoom.type;
            newForm.totalSeats =
              firstRoom.capacity || firstRoom.totalSeats || 0;
            newForm.availableSeats =
              firstRoom.capacity || firstRoom.totalSeats || 0;
          } else {
            newForm.roomId = "";
            newForm.roomName = "";
            newForm.type = "";
            newForm.totalSeats = 0;
            newForm.availableSeats = 0;
          }
        }
      }

      // Khi chọn room, cập nhật thông tin phòng
      if (
        updates.roomId !== undefined &&
        updates.roomId !== prev.roomId &&
        newForm.cinemaId
      ) {
        const cinema = cinemas.find((c) => c.id == newForm.cinemaId);
        const room = cinema?.rooms?.find((r) => r.id == updates.roomId);
        if (room) {
          newForm.roomName = room.name;
          newForm.type = room.type;
          newForm.totalSeats = room.capacity || room.totalSeats || 0;
          newForm.availableSeats = room.capacity || room.totalSeats || 0;
          
          const seatPrices = getPricesBySeatType(newForm.date, newForm.time, newForm.type);
          if (seatPrices) {
            newForm.prices = seatPrices;
          }
        }
      }

      // Khi chọn movie, cập nhật tên phim và thời gian kết thúc
      if (updates.movieId !== undefined && updates.movieId !== prev.movieId) {
        const movie = movies.find((m) => m.id == updates.movieId);
        if (movie) {
          newForm.movieTitle = movie.title;
          newForm.movieDuration = movie.duration;
          if (newForm.time) {
            newForm.endTime = calculateEndTime(newForm.time, movie.duration);
          }
        }
      }

      // Khi thay đổi thời gian, cập nhật thời gian kết thúc
      if (
        updates.time !== undefined &&
        updates.time !== prev.time &&
        newForm.movieId
      ) {
        const duration = getMovieDuration(newForm.movieId);
        newForm.endTime = calculateEndTime(newForm.time, duration);
      }

      // Tính giá vé khi có đủ thông tin
      if (
        (updates.date !== undefined ||
          updates.time !== undefined ||
          updates.type !== undefined ||
          updates.specialType !== undefined) &&
        newForm.date &&
        newForm.time &&
        newForm.type
      ) {
        const basePrice = getBasePriceByTime(
          newForm.date,
          newForm.time,
          newForm.type
        );

        if (newForm.specialType && newForm.specialType !== "none") {
          newForm.price = calculateSpecialPrice(
            basePrice,
            newForm.specialType,
            newForm.type
          );
          newForm.special = true;
        } else {
          newForm.price = basePrice;
          newForm.special = false;
        }
      }

      return newForm;
    });
  };

  const handleAdd = () => {
    if (pricingRules.length === 0) {
      toast.error("Vui lòng thiết lập bảng giá trước khi thêm suất chiếu!");
      return;
    }
    setEditingShowtime(null);
    initNewForm();
    setShowModal(true);
  };

  const handleEdit = (showtime) => {
    setEditingShowtime(showtime);
    setForm(showtime);
    setShowModal(true);
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
        return { conflict: true, with: existing };
      }
    }
    return { conflict: false };
  };

  const handleSave = async (formData) => {
    setLoading(true);

    try {
      const finalFormData = {
        ...formData,
        endTime:
          formData.endTime ||
          calculateEndTime(formData.time, getMovieDuration(formData.movieId)),
      };

      const { conflict, with: conflictingShow } = checkConflict(finalFormData);

      if (conflict) {
        const confirm = window.confirm(
          `Suất chiếu này xung đột với "${conflictingShow.movieTitle}" lúc ${conflictingShow.time}. Bạn có muốn tiếp tục?`
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      if (editingShowtime) {
        setShowtimes((prev) =>
          prev.map((s) =>
            s.id === editingShowtime.id ? { ...s, ...finalFormData } : s
          )
        );
        toast.success("Cập nhật suất chiếu thành công!");
      } else {
        const newShowtime = {
          id: `ST${Date.now()}`,
          ...finalFormData,
          availableSeats: finalFormData.totalSeats || 0,
          bookedCount: 0,
          revenue: 0,
          status: finalFormData.status || "scheduled",
        };
        setShowtimes((prev) => [newShowtime, ...prev]);
        toast.success("Thêm suất chiếu thành công!");
      }

      setShowModal(false);
      setEditingShowtime(null);
      initNewForm();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Có lỗi xảy ra khi lưu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
      setLoading(true);
      try {
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

  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast.error("Không có dữ liệu để xuất!");
      return;
    }

    const exportData = filtered.map((s) => ({
      "Tên phim": s.movieTitle,
      Rạp: s.cinemaName,
      Phòng: s.roomName,
      Ngày: s.date,
      Giờ: s.time,
      "Định dạng": s.type,
      "Loại suất": s.special ? "Đặc biệt" : "Thường",
      "Ghế trống": `${s.availableSeats}/${s.totalSeats}`,
      "Giá vé (người lớn)": `${s.price?.adult?.toLocaleString()}đ`,
      "Trạng thái": statusConfig[s.status]?.label || s.status,
    }));

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
      <html><head><title>Lịch chiếu phim - ${today}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #e50914; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f5f5f5; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
      </style></head>
      <body>
        <h1>LỊCH CHIẾU PHIM - ${today}</h1>
        <p>Tổng số: ${filtered.length} suất chiếu</p>
        <table>
          <thead>
            <tr>
              <th>Phim</th>
              <th>Rạp</th>
              <th>Phòng</th>
              <th>Ngày</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Định dạng</th>
              <th>Ghế Thường</th>
              <th>Ghế VIP</th>
              <th>Ghế Couple</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                (s) => `
              <tr>
                <td>${s.movieTitle || ""}</td>
                <td>${s.cinemaName || ""}</td>
                <td>${s.roomName || ""}</td>
                <td>${new Date(s.date).toLocaleDateString("vi-VN")}</td>
                <td>${s.time || ""}</td>
                <td>${s.endTime || ""}</td>
                <td>${s.type || ""}</td>
                <td>${s.prices?.Thường?.toLocaleString() || 0}đ</td>
                <td>${s.prices?.VIP?.toLocaleString() || 0}đ</td>
                <td>${s.prices?.Couple?.toLocaleString() || 0}đ</td>
                <td>${
                  statusConfig[s.status]?.label || s.status || "Sắp chiếu"
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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

  const filtered = showtimes.filter((s) => {
    const matchSearch =
      search === "" ||
      s.movieTitle?.toLowerCase().includes(search.toLowerCase()) ||
      s.cinemaName?.toLowerCase().includes(search.toLowerCase()) ||
      s.roomName?.toLowerCase().includes(search.toLowerCase());

    const matchCinema = cinemaFilter === "all" || s.cinemaId == cinemaFilter;

    const matchSpecial = specialFilter === "all" ||
      (specialFilter === "special" && s.special) ||
      (specialFilter !== "special" &&
        specialFilter !== "all" &&
        s.specialType === specialFilter);

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

  // Update showtimes status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setShowtimes(prev => prev.map(showtime => {
        const now = new Date();
        const showDate = new Date(`${showtime.date}T${showtime.time}`);
        
        // Xử lý end time cho việc kiểm tra trạng thái
        let endDate = showtime.date;
        let endTimeRaw = showtime.endTime;
        if (endTimeRaw && endTimeRaw.includes('ngày hôm sau')) {
          endTimeRaw = endTimeRaw.replace(' (ngày hôm sau)', '');
          endDate = new Date(new Date(showtime.date).getTime() + 86400000).toISOString().split('T')[0];
        }
        const endDateObj = new Date(`${endDate}T${endTimeRaw || addHours(showtime.time, 2)}`);
        
        let newStatus = showtime.status;
        if (showtime.status !== "cancelled") {
          if (now > endDateObj) {
            newStatus = "ended";
          } else if (now >= showDate && now <= endDateObj) {
            newStatus = "ongoing";
          } else if (now < showDate) {
            newStatus = "scheduled";
          }
        }
        return { ...showtime, status: newStatus };
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const availableDates = [...new Set(showtimes.map((s) => s.date))].sort();

  if (dataLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <ShowtimesHeader 
        total={showtimes.length} 
        onAdd={handleAdd}
        onExport={handleExport}
      />

      <ShowtimesStats
        showtimes={showtimes}
        onDateChange={setDateFilter}
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
        availableDates={availableDates}
        cinemas={cinemas}
      />

      {selectedShowtimes.length > 0 && (
        <BulkActionBar
          count={selectedShowtimes.length}
          onClear={() => setSelectedShowtimes([])}
          onDelete={handleBulkDelete}
          onStatusChange={handleBulkStatusChange}
          onQuickEdit={() => setShowQuickEdit(true)}
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
      />

      {showModal && (
        <ShowtimeModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingShowtime(null);
            initNewForm();
          }}
          onSave={handleSave}
          form={form}
          setForm={updateForm}
          isEdit={!!editingShowtime}
          movies={movies}
          cinemas={cinemas}
          loading={loading}
        />
      )}

      <QuickEditModal
        show={showQuickEdit}
        onClose={() => {
          setShowQuickEdit(false);
          setEditingShowtime(null);
        }}
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
      />
    </div>
  );
}