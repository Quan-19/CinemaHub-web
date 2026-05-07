// hooks/useShowtimes.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getTodayDate, formatDateToDisplay } from "../../../utils/dateUtils";
import { normalizeShowtimePricing } from "../../../utils/showtimePricing";

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

export const getStatusLabel = (status) => {
  const statusMap = {
    scheduled: "Sắp chiếu",
    ongoing: "Đang chiếu",
    ended: "Đã kết thúc",
    cancelled: "Đã hủy"
  };
  return statusMap[status] || status;
};

export const normalizeShowtimesData = (showtimesData) => {
  return (Array.isArray(showtimesData) ? showtimesData : []).map((s) => {
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

    const pricing = normalizeShowtimePricing(s);
    const basePrice = Number(s.base_price) || pricing.basePrice;
    
    const status = s.status || 'scheduled';

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
      start_time: s.start_time,
      end_time: s.end_time,
      isSpecial: Boolean(s.isSpecial ?? s.special ?? s.is_special ?? false),
      specialType: s.specialType || s.special_type || null,
      specialPromotionId: s.specialPromotionId || s.special_promotion_id || null,
      specialPricingRuleId: s.specialPricingRuleId || s.special_pricing_rule_id || null,
      regularPrices: pricing.regularPrices,
      specialPrices: pricing.specialPrices,
      prices: pricing.prices,
      base_price: basePrice,
      priceSource: pricing.priceSource,
      totalSeats: s.totalSeats || 100,
      availableSeats: s.availableSeats || 100,
      bookedCount: s.bookedCount || 0,
      status: status,
      special: Boolean(s.isSpecial ?? s.special ?? s.is_special ?? false),
    };
  });
};

export function useShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [selectedShowtimes, setSelectedShowtimes] = useState([]);

  // Load data
  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [moviesRes, cinemasRes, showtimesRes, roomsRes] = await Promise.all([
        fetch("http://localhost:5000/api/movies?scope=manage"),
        fetch("http://localhost:5000/api/cinemas"),
        fetch("http://localhost:5000/api/showtimes"),
        fetch("http://localhost:5000/api/rooms"),
      ]);

      const moviesData = await moviesRes.json();
      const cinemasData = await cinemasRes.json();
      const showtimesData = await showtimesRes.json();
      const roomsData = await roomsRes.json();

      setMovies(moviesData);

      const roomsByCinema = {};
      (Array.isArray(roomsData) ? roomsData : []).forEach((room) => {
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

      const normalizedCinemas = (Array.isArray(cinemasData) ? cinemasData : []).map((cinema) => {
        const cinemaId = cinema.cinema_id || cinema.id;
        const rooms = roomsByCinema[cinemaId] || [];
        return {
          id: cinemaId,
          cinema_id: cinemaId,
          name: cinema.name || "",
          brand: cinema.brand || "EbizCinema",
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

      setCinemas(normalizedCinemas);
      setShowtimes(normalizeShowtimesData(showtimesData));
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Lỗi tải dữ liệu!");
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/showtimes");
      if (response.ok) {
        const freshData = await response.json();
        setShowtimes(normalizeShowtimesData(freshData));
        setLastRefreshTime(new Date());
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }, []);

  // Cancel single showtime - có callback đóng modal
  const cancelShowtime = useCallback(async (id, movieTitle, showtime, onSuccess) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5000/api/showtimes/${id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Hủy suất chiếu thất bại");
      }

      await refreshData();
      toast.success(`Đã hủy suất chiếu của phim "${movieTitle}"`);
      
      // Gọi callback đóng modal nếu có
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      return { success: true };
    } catch (error) {
      console.error("Cancel showtime error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi hủy suất chiếu!");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Delete single showtime - có callback đóng modal
  const deleteShowtime = useCallback(async (id, movieTitle, onSuccess) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/showtimes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Xóa thất bại");
      }

      setShowtimes((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Đã xóa suất chiếu của phim "${movieTitle}"!`);
      
      // Gọi callback đóng modal nếu có
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      return { success: true };
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa!");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk cancel
  const bulkCancelShowtimes = useCallback(async (selectedItems, onSuccess) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      let successCount = 0;
      let failCount = 0;
      
      for (const showtime of selectedItems) {
        try {
          const response = await fetch(`http://localhost:5000/api/showtimes/${showtime.id}/cancel`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      }
      
      await refreshData();
      
      if (successCount > 0) {
        toast.success(`Đã hủy ${successCount} suất chiếu${failCount > 0 ? `, thất bại ${failCount} suất` : ''}`);
      } else {
        toast.error(`Không thể hủy suất chiếu nào.`);
      }
      
      // Gọi callback đóng modal nếu có
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      return { successCount, failCount };
    } catch (error) {
      console.error("Bulk cancel error:", error);
      toast.error("Có lỗi xảy ra khi hủy hàng loạt!");
      return { successCount: 0, failCount: selectedItems.length };
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Bulk delete
  const bulkDeleteShowtimes = useCallback(async (selectedIds, onSuccess) => {
    setLoading(true);
    try {
      // Xóa từng suất một
      let successCount = 0;
      let failCount = 0;
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      for (const id of selectedIds) {
        try {
          const response = await fetch(`http://localhost:5000/api/showtimes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      }
      
      setShowtimes((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      
      if (successCount > 0) {
        toast.success(`Đã xóa ${successCount} suất chiếu${failCount > 0 ? `, thất bại ${failCount} suất` : ''}`);
      } else {
        toast.error(`Không thể xóa suất chiếu nào.`);
      }
      
      // Gọi callback đóng modal nếu có
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      return { success: true, successCount, failCount };
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh every minute
  useEffect(() => {
    const interval = setInterval(refreshData, 60000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
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
  };
}