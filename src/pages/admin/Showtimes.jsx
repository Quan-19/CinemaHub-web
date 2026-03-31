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
    const hour = parseInt(time.split(":")[0]);
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
      const matchingRule = pricingRules.find(
        (rule) =>
          rule.type === type &&
          rule.seat === seat &&
          rule.day === dayType &&
          rule.time === timeSlot &&
          rule.active === true,
      );

      if (matchingRule) {
        prices[seat] = matchingRule.final;
      } else {
        const fallbackRule = pricingRules.find(
          (rule) =>
            rule.type === type && rule.seat === seat && rule.active === true,
        );
        prices[seat] = fallbackRule ? fallbackRule.final : 0;
      }
    }

    return prices;
  };

  // Load tất cả dữ liệu từ API
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const [moviesRes, cinemasRes, showtimesRes, roomsRes] = await Promise.all([
          fetch("http://localhost:5000/api/movies"),
          fetch("http://localhost:5000/api/cinemas"),
          fetch("http://localhost:5000/api/showtimes"),
          fetch("http://localhost:5000/api/rooms"),
        ]);

        const moviesData = await moviesRes.json();
        const cinemasData = await cinemasRes.json();
        let showtimesData = await showtimesRes.json();
        const roomsData = await roomsRes.json();

        console.log("🟢 RAW CINEMAS DATA:", cinemasData);
        console.log("🟢 RAW ROOMS DATA:", roomsData);

        setMovies(moviesData);

        // Gom rooms theo cinemaId
        const roomsByCinema = {};
        (Array.isArray(roomsData) ? roomsData : []).forEach(room => {
          const cinemaId = room.cinema_id || room.cinemaId;
          if (!roomsByCinema[cinemaId]) roomsByCinema[cinemaId] = [];
          roomsByCinema[cinemaId].push({
            id: room.room_id || room.id,
            name: room.name,
            type: room.type,
            capacity: room.total_seats || room.capacity || 100,
            rows: room.seat_rows || 10,
            cols: room.seat_cols || 12,
            status: room.status || "active",
          });
        });

        // Chuẩn hóa cinemas với rooms
        const normalizedCinemas = (Array.isArray(cinemasData) ? cinemasData : []).map((cinema) => {
          const cinemaId = cinema.cinema_id || cinema.id;
          const rooms = roomsByCinema[cinemaId] || [];
          
          return {
            id: cinemaId,
            cinema_id: cinemaId,
            name: cinema.name || "",
            brand: cinema.brand || "CGV",
            city: cinema.city || "",
            address: cinema.address || "",
            phone: cinema.phone || "",
            maxRooms: cinema.maxRooms || 4,
            currentRooms: rooms.length,
            rooms: rooms,
            status: cinema.status || "active",
            managerId: cinema.manager_id || cinema.managerId || null,
            managerName: cinema.manager_name || cinema.managerName || null,
          };
        });

        console.log("🟢 NORMALIZED CINEMAS WITH ROOMS:", normalizedCinemas);
        setCinemas(normalizedCinemas);

        // Chuẩn hóa showtimes
        const normalizedShowtimes = (Array.isArray(showtimesData) ? showtimesData : []).map((s) => {
          let formattedDate = s.date;
          if (s.date && s.date.includes("T")) {
            formattedDate = s.date.split("T")[0];
          }

          let formattedTime = s.time;
          if (s.time && s.time.includes(":")) {
            formattedTime = s.time.slice(0, 5);
          }

          let formattedEndTime = s.endTime;
          if (formattedEndTime && formattedEndTime.includes("T")) {
            formattedEndTime = formattedEndTime.slice(0, 5);
          } else if (formattedEndTime && formattedEndTime.includes(":")) {
            formattedEndTime = formattedEndTime.slice(0, 5);
          }

          const normalizedPrices = {
            Thường: Number(s.prices?.Thường) || Number(s.base_price) || 90000,
            VIP: Number(s.prices?.VIP) || Number(s.base_price) * 1.2,
            Couple: Number(s.prices?.Couple) || Number(s.base_price) * 1.5,
          };

          let normalizedStatus = s.status;
          if (s.status === "available") normalizedStatus = "scheduled";

          return {
            id: String(s.id) || String(s.showtime_id),
            movieId: s.movieId || s.movie_id,
            movieTitle: s.movieTitle || s.movie_title || "Không xác định",
            cinemaId: s.cinemaId || s.cinema_id,
            cinemaName: s.cinemaName || s.cinema_name || "Không xác định",
            roomId: s.roomId || s.room_id,
            roomName: s.roomName || s.room_name || "Không xác định",
            type: s.type || s.format || "2D",
            date: formattedDate,
            time: formattedTime,
            endTime: formattedEndTime || "---",
            prices: normalizedPrices,
            base_price: Number(s.base_price) || normalizedPrices.Thường,
            totalSeats: s.totalSeats || 100,
            availableSeats: s.availableSeats || 100,
            bookedCount: s.bookedCount || 0,
            revenue: s.revenue || 0,
            status: normalizedStatus,
            special: s.special || false,
            specialType: s.specialType || null,
          };
        });

        console.log("🟢 NORMALIZED SHOWTIMES:", normalizedShowtimes);
        setShowtimes(normalizedShowtimes);

        const savedPricingRules = localStorage.getItem("pricing_rules");
        if (savedPricingRules) {
          setPricingRules(JSON.parse(savedPricingRules));
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
    console.log("🔍 ALL SHOWTIMES:", showtimes);
    console.log("🔍 FIRST SHOWTIME:", showtimes[0]);
    console.log("🔍 PRICES STRUCTURE:", showtimes[0]?.prices);
  }, [showtimes]);

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
    if (!date || !time || !type) return 90000;

    const showDate = new Date(date);
    const dayOfWeek = showDate.getDay();
    const hour = parseInt(time.split(":")[0]);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (hour < 12) {
      return 75000;
    } else if (hour >= 22) {
      return 110000;
    } else if (isWeekend) {
      return 100000;
    } else {
      return 90000;
    }
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "22:00";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes + 15;
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
      movieId: "",
      movieTitle: "",
      movieDuration: null,
      cinemaId: "",
      cinemaName: "",
      roomId: "",
      roomName: "",
      type: "",
      date: new Date().toISOString().split("T")[0],
      time: "14:00",
      endTime: "",
      prices: {
        Thường: 0,
        VIP: 0,
        Couple: 0,
      },
      totalSeats: 0,
      availableSeats: 0,
      status: "scheduled",
    });
  };

  const updateForm = (updates) => {
    setForm((prev) => {
      const newForm = { ...prev, ...updates };

      if (updates.cinemaId !== undefined && updates.cinemaId !== prev.cinemaId) {
        const cinema = cinemas.find((c) => c.id == updates.cinemaId);
        if (cinema) {
          newForm.cinemaName = cinema.name;
          const rooms = cinema.rooms || [];

          if (rooms.length > 0) {
            const firstRoom = rooms[0];
            newForm.roomId = firstRoom.id;
            newForm.roomName = firstRoom.name;
            newForm.type = firstRoom.type;
            newForm.totalSeats = firstRoom.capacity || 100;
            newForm.availableSeats = firstRoom.capacity || 100;
          } else {
            newForm.roomId = "";
            newForm.roomName = "";
            newForm.type = "";
            newForm.totalSeats = 0;
            newForm.availableSeats = 0;
          }
        }
      }

      if (updates.roomId !== undefined && updates.roomId !== prev.roomId && newForm.cinemaId) {
        const cinema = cinemas.find((c) => c.id == newForm.cinemaId);
        const room = cinema?.rooms?.find((r) => r.id == updates.roomId);
        if (room) {
          newForm.roomName = room.name;
          newForm.type = room.type;
          newForm.totalSeats = room.capacity || 100;
          newForm.availableSeats = room.capacity || 100;
        }
      }

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

      if (updates.time !== undefined && updates.time !== prev.time && newForm.movieId) {
        const duration = getMovieDuration(newForm.movieId);
        newForm.endTime = calculateEndTime(newForm.time, duration);
      }

      if (newForm.date && newForm.time && newForm.type) {
        const basePrice = getBasePriceByTime(newForm.date, newForm.time, newForm.type);
        newForm.prices = {
          Thường: basePrice,
          VIP: Math.round(basePrice * 1.2),
          Couple: Math.round(basePrice * 1.5),
        };
        newForm.base_price = basePrice;
      }

      return newForm;
    });
  };

  const checkConflict = (newShowtime) => {
    const conflicts = showtimes.filter(
      (s) =>
        s.cinemaId == newShowtime.cinemaId &&
        s.roomId == newShowtime.roomId &&
        s.date === newShowtime.date &&
        s.id !== newShowtime.id &&
        s.status !== "cancelled",
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
    setEditingShowtime(showtime);
    setForm(showtime);
    setShowModal(true);
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
        const confirm = window.confirm(
          `Suất chiếu này xung đột với "${conflictingShow.movieTitle}" lúc ${conflictingShow.time}. Bạn có muốn tiếp tục?`,
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      // Xử lý endTime
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

      // Chuẩn bị payload
      const payload = {
        movieId: Number(finalFormData.movieId),
        cinemaId: Number(finalFormData.cinemaId),
        roomId: Number(finalFormData.roomId),
        date: finalFormData.date,
        time: finalFormData.time,
        endTime: cleanEndTime,
        type: finalFormData.type,
        base_price: finalFormData.prices?.Thường || 90000,
        status: finalFormData.status || "scheduled",
      };

      console.log("📦 Payload gửi lên API:", payload);

      const token = localStorage.getItem("token");
      
      let response;
      let url = "http://localhost:5000/api/showtimes";
      let method = "POST";
      
      if (editingShowtime) {
        const showtimeId = editingShowtime.id;
        console.log("🔄 Đang cập nhật suất chiếu với ID:", showtimeId);
        url = `http://localhost:5000/api/showtimes/${showtimeId}`;
        method = "PUT";
      }
      
      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("📥 Response status:", response.status);
      console.log("📥 Response body:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || "Lưu thất bại");
      }

      if (editingShowtime) {
        setShowtimes((prev) =>
          prev.map((s) =>
            s.id === editingShowtime.id ? { ...s, ...finalFormData, id: result.id || s.id } : s,
          ),
        );
        toast.success("Cập nhật suất chiếu thành công!");
      } else {
        const newShowtime = {
          id: result.id || result.showtime_id || `ST${Date.now()}`,
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
      toast.error(error.message || "Có lỗi xảy ra khi lưu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/showtimes/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Xóa thất bại");
        }

        setShowtimes((prev) => prev.filter((s) => s.id !== id));
        toast.success("Xóa suất chiếu thành công!");
      } catch (error) {
        toast.error(error.message || "Có lỗi xảy ra!");
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
      `Bạn có chắc muốn xóa ${selectedShowtimes.length} suất chiếu?`,
    );
    if (!confirm) return;

    setLoading(true);
    try {
      setShowtimes((prev) =>
        prev.filter((s) => !selectedShowtimes.includes(s.id)),
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
          selectedShowtimes.includes(s.id) ? { ...s, status: newStatus } : s,
        ),
      );
      setSelectedShowtimes([]);
      toast.success(
        `Đã cập nhật trạng thái ${selectedShowtimes.length} suất chiếu`,
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
      "Giá vé (người lớn)": `${s.prices?.Thường?.toLocaleString()}đ`,
      "Trạng thái": statusConfig[s.status]?.label || s.status,
    }));

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(","),
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
      `suat-chieu-${new Date().toISOString().split("T")[0]}.csv`,
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
            `,
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

    const matchSpecial =
      specialFilter === "all" ||
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
      setShowtimes((prev) =>
        prev.map((showtime) => {
          const now = new Date();
          const showDate = new Date(`${showtime.date}T${showtime.time}`);

          let endDate = showtime.date;
          let endTimeRaw = showtime.endTime;
          if (endTimeRaw && endTimeRaw.includes("ngày hôm sau")) {
            endTimeRaw = endTimeRaw.replace(" (ngày hôm sau)", "");
            endDate = new Date(new Date(showtime.date).getTime() + 86400000)
              .toISOString()
              .split("T")[0];
          }
          const endDateObj = new Date(`${endDate}T${endTimeRaw || "23:59"}`);

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
        }),
      );
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

      <ShowtimesStats showtimes={showtimes} onDateChange={setDateFilter} />

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
                selectedShowtimes.includes(s.id) ? { ...s, ...updates } : s,
              ),
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