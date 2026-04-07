// ShowtimeModal.jsx - Sửa phần fetch promotions

import { X, Search, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getTodayDate } from "../../../utils/dateUtils";
import {
  DEFAULT_REGULAR_PRICES,
  normalizePriceMap,
} from "../../../utils/showtimePricing";

export default function ShowtimeModal({
  show,
  onClose,
  onSave,
  form,
  setForm,
  isEdit,
  movies,
  cinemas,
  loading,
}) {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [searchMovieTerm, setSearchMovieTerm] = useState("");
  const [showMovieDropdown, setShowMovieDropdown] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [holidayPricingRules, setHolidayPricingRules] = useState([]);
  const [holidayPricingLoading, setHolidayPricingLoading] = useState(false);
  const movieInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // API URLs
  const PRICING_API_URL = "http://localhost:5000/api/pricing";

  const formatVndWithCommas = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "";
    return Math.round(numericValue).toLocaleString("en-US");
  };

  const parseVndInput = (text) => {
    const cleaned = String(text ?? "").replace(/[^0-9]/g, "");
    if (!cleaned) return 0;
    const numericValue = Number(cleaned);
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const buildSeatPriceMapFromHolidayRule = (rule) => {
    const prices = {};
    const list = Array.isArray(rule?.holiday_prices) ? rule.holiday_prices : [];
    for (const item of list) {
      const seatType = item?.seat_type;
      const price = Number(item?.price);
      if (seatType && Number.isFinite(price) && price > 0) {
        prices[seatType] = price;
      }
    }
    return normalizePriceMap(prices, DEFAULT_REGULAR_PRICES);
  };

  const isHolidayRuleApplicable = (rule) => {
    const isHoliday =
      rule?.pricing_type === "HOLIDAY" || rule?.type === "HOLIDAY";
    if (!rule || !isHoliday) return false;
    if (!(rule.active ?? rule.is_active ?? false)) return false;

    if (
      form?.type &&
      rule.holiday_room_type &&
      rule.holiday_room_type !== form.type
    ) {
      return false;
    }

    if (form?.date && rule.start_date && rule.end_date) {
      const showDate = new Date(form.date);
      const start = new Date(rule.start_date);
      const end = new Date(rule.end_date);
      if (showDate < start || showDate > end) return false;

      if (Array.isArray(rule.apply_days)) {
        const day = showDate.getDay();
        if (!rule.apply_days.includes(day)) return false;
      }
    }

    return true;
  };

  useEffect(() => {
    const fetchHolidayPricingRules = async () => {
      if (!show || !form?.isSpecial) return;

      setHolidayPricingLoading(true);
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch(`${PRICING_API_URL}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();

        const rules =
          result?.success && Array.isArray(result?.data) ? result.data : [];
        setHolidayPricingRules(
          rules.filter(
            (r) => r?.pricing_type === "HOLIDAY" || r?.type === "HOLIDAY"
          )
        );
      } catch (error) {
        console.error("Error fetching holiday pricing rules:", error);
        setHolidayPricingRules([]);
      } finally {
        setHolidayPricingLoading(false);
      }
    };

    fetchHolidayPricingRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, form?.isSpecial]);

  useEffect(() => {
    console.log("🔍 ShowtimeModal - cinemas received:", cinemas);
    console.log("🔍 ShowtimeModal - cinemas length:", cinemas?.length);
    if (cinemas && cinemas.length > 0) {
      console.log("🔍 First cinema:", cinemas[0]);
      console.log("🔍 First cinema rooms:", cinemas[0]?.rooms);
    }
  }, [cinemas]);

  useEffect(() => {
    if (form?.cinemaId) {
      const cinema = cinemas?.find((c) => c.id == form.cinemaId);
      console.log("🔍 Selected cinema:", cinema);
      if (cinema) {
        const rooms = cinema.rooms || [];
        console.log("🔍 Available rooms:", rooms);
        setAvailableRooms(rooms);
      } else {
        setAvailableRooms([]);
      }
    } else {
      setAvailableRooms([]);
    }
  }, [form?.cinemaId, cinemas]);

  useEffect(() => {
    if (form?.movieTitle) {
      setSearchMovieTerm(form.movieTitle);
    }
  }, [form?.movieTitle]);

  useEffect(() => {
    if (searchMovieTerm.trim() === "") {
      setFilteredMovies([]);
    } else {
      const filtered = movies.filter((movie) =>
        movie.title?.toLowerCase().includes(searchMovieTerm.toLowerCase())
      );
      setFilteredMovies(filtered.slice(0, 10));
    }
  }, [searchMovieTerm, movies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        movieInputRef.current &&
        !movieInputRef.current.contains(event.target)
      ) {
        setShowMovieDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ensure specialPrices exists when editing an existing special showtime
  useEffect(() => {
    if (!isEdit) return;
    if (!form?.isSpecial) return;
    if (form?.specialPrices) return;

    const seed = form?.prices || form?.regularPrices || DEFAULT_REGULAR_PRICES;
    setForm({
      ...form,
      specialPrices: normalizePriceMap(seed, DEFAULT_REGULAR_PRICES),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.isSpecial]);

  // Auto fetch regular prices for regular showtimes only
  useEffect(() => {
    const fetchRegularPrices = async () => {
      // Only fetch if regular showtime is selected
      if (form?.isSpecial || !form?.type || !form?.date || !form?.time) return;

      console.log("💰 Fetching regular prices with params:", {
        type: form.type,
        date: form.date,
        time: form.time,
      });

      setPricingLoading(true);
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");
        const response = await fetch(
          `${PRICING_API_URL}/preview-prices?type=${form.type}&date=${form.date}&time=${form.time}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();
        console.log("💰 Regular prices from pricing API:", result);

        if (!response.ok || !result?.success || !result?.data) {
          const errorMessage =
            result?.message ||
            result?.error ||
            "Chưa có quy tắc giá vé cho loại phòng này. Vui lòng vào trang Giá vé để thêm quy tắc.";

          setForm({
            ...form,
            regularPricingError: errorMessage,
            regularPrices: null,
            prices: null,
            base_price: 0,
            priceSource: "regular",
          });
          return;
        }

        const regularPrices = normalizePriceMap(result.data, {
          Thường: 0,
          VIP: 0,
          Couple: 0,
        });
        setForm({
          ...form,
          regularPricingError: null,
          regularPrices,
          prices: regularPrices,
          base_price: regularPrices.Thường || 0,
          priceSource: "regular",
        });
      } catch (error) {
        console.error("Error fetching regular prices:", error);
        setForm({
          ...form,
          regularPricingError:
            "Không thể lấy giá vé. Vui lòng kiểm tra quy tắc giá vé ở trang Giá vé.",
          regularPrices: null,
          prices: null,
          base_price: 0,
          priceSource: "regular",
        });
      } finally {
        setPricingLoading(false);
      }
    };

    fetchRegularPrices();
  }, [form?.type, form?.date, form?.time, form?.isSpecial]);

  if (!show) return null;

  const inputClass =
    "w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30";

  const selectClass =
    "w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition [&>option]:bg-zinc-900 [&>option]:text-white";

  const handleMovieSelect = (movie) => {
    setForm({
      ...form,
      movieId: movie.id,
      movieTitle: movie.title,
      movieDuration: movie.duration,
    });
    setSearchMovieTerm(movie.title);
    setShowMovieDropdown(false);
  };

  const handleMovieSearchChange = (value) => {
    setSearchMovieTerm(value);
    setShowMovieDropdown(true);
    if (value === "") {
      setForm({ ...form, movieId: "", movieTitle: "", movieDuration: null });
    }
  };

  const handleCinemaChange = (cinemaId) => {
    const cinema = cinemas?.find((c) => c.id == cinemaId);
    console.log("🎬 Cinema changed to:", cinemaId, cinema);
    if (cinema) {
      const rooms = cinema.rooms || [];
      console.log("📺 Rooms in this cinema:", rooms);

      setForm({
        ...form,
        cinemaId,
        cinemaName: cinema?.name || "",
        roomId: "",
        roomName: "",
        type: "",
        totalSeats: 0,
        availableSeats: 0,
      });
      setAvailableRooms(rooms);
    } else {
      setAvailableRooms([]);
      setForm({
        ...form,
        cinemaId,
        cinemaName: "",
        roomId: "",
        roomName: "",
        type: "",
        totalSeats: 0,
        availableSeats: 0,
      });
    }
  };

  const handleRoomChange = (roomId) => {
    const cinema = cinemas?.find((c) => c.id == form.cinemaId);
    const room = cinema?.rooms?.find((r) => r.id == roomId);
    console.log("🎬 Room changed to:", roomId, room);
    if (room) {
      setForm({
        ...form,
        roomId,
        roomName: room.name,
        type: room.type,
        totalSeats: room.capacity || 100,
        availableSeats: room.capacity || 100,
      });
    }
  };

  const handlePriceChange = (seatType, value) => {
    const nextValue = typeof value === "number" ? value : parseVndInput(value);
    const nextPrices = {
      ...(form?.prices || DEFAULT_REGULAR_PRICES),
      [seatType]: nextValue,
    };

    setForm({
      ...form,
      regularPrices: nextPrices,
      prices: form?.isSpecial ? form.specialPrices || nextPrices : nextPrices,
      base_price: nextPrices.Thường || 90000,
    });
  };

  const handleSpecialPriceChange = (seatType, value) => {
    const nextValue = typeof value === "number" ? value : parseVndInput(value);
    const nextSpecialPrices = {
      ...(form?.specialPrices || form?.prices || DEFAULT_REGULAR_PRICES),
      [seatType]: nextValue,
    };

    setForm({
      ...form,
      specialPrices: nextSpecialPrices,
      prices: form?.isSpecial
        ? nextSpecialPrices
        : form?.regularPrices || nextSpecialPrices,
      base_price: nextSpecialPrices.Thường || form?.base_price || 90000,
    });
  };

  const handleSpecialToggle = (isSpecial) => {
    if (isSpecial) {
      // Switching to special - require selecting a pricing rule to populate prices
      setForm({
        ...form,
        isSpecial: true,
        specialPrices: null,
        specialPromotionId: null,
        specialPricingRuleId: null,
        prices: null,
        base_price: 0,
        priceSource: "special",
      });
    } else {
      // Switching back to regular
      setForm({
        ...form,
        isSpecial: false,
        specialPrices: null,
        specialPromotionId: null,
        specialPricingRuleId: null,
        prices: form?.regularPrices || null,
        base_price: form?.regularPrices?.Thường || 0,
        priceSource: "regular",
      });
    }
  };

  const applicableHolidayRules = holidayPricingRules.filter(
    isHolidayRuleApplicable
  );
  const selectedHolidayRule = holidayPricingRules.find(
    (r) => Number(r?.id) === Number(form?.specialPricingRuleId)
  );
  const holidayRuleOptions = selectedHolidayRule
    ? [selectedHolidayRule, ...applicableHolidayRules].filter(
        (rule, index, list) =>
          list.findIndex((r) => Number(r?.id) === Number(rule?.id)) === index
      )
    : applicableHolidayRules;

  const handleHolidayRuleSelect = (ruleId) => {
    const parsedId = ruleId ? Number(ruleId) : null;
    const selectedRule =
      holidayPricingRules.find((r) => Number(r?.id) === parsedId) || null;

    if (!parsedId || !selectedRule) {
      setForm({
        ...form,
        specialPricingRuleId: null,
        specialPrices: null,
        prices: form?.isSpecial ? null : form?.prices,
        base_price: 0,
      });
      return;
    }

    const nextSpecialPrices = buildSeatPriceMapFromHolidayRule(selectedRule);
    setForm({
      ...form,
      specialPricingRuleId: parsedId,
      specialPrices: nextSpecialPrices,
      prices: form?.isSpecial
        ? nextSpecialPrices
        : form?.regularPrices || nextSpecialPrices,
      base_price: nextSpecialPrices.Thường || 90000,
      priceSource: "special",
    });
  };

  const calculateEndTime = () => {
    if (!form?.time || !form?.movieDuration) return "";
    const [hours, minutes] = form.time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + form.movieDuration + 15;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    if (endHours >= 24) {
      const nextDayHours = endHours - 24;
      return `${String(nextDayHours).padStart(2, "0")}:${String(
        endMinutes
      ).padStart(2, "0")} (ngày hôm sau)`;
    }

    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(
      2,
      "0"
    )}`;
  };

  const handleTimeChange = (time) => {
    if (!form?.movieDuration) {
      setForm({ ...form, time: time, endTime: "" });
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + form.movieDuration + 15;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    let endTimeStr;
    if (endHours >= 24) {
      const nextDayHours = endHours - 24;
      endTimeStr = `${String(nextDayHours).padStart(2, "0")}:${String(
        endMinutes
      ).padStart(2, "0")} (ngày hôm sau)`;
    } else {
      endTimeStr = `${String(endHours).padStart(2, "0")}:${String(
        endMinutes
      ).padStart(2, "0")}`;
    }

    setForm({
      ...form,
      time: time,
      endTime: endTimeStr,
    });
  };

  const selectedCinema = cinemas?.find((c) => c.id == form?.cinemaId);
  const currentRoomCount = selectedCinema?.rooms?.length || 0;
  const maxRooms = selectedCinema?.maxRooms || 4;

  const hasRooms = availableRooms.length > 0;
  const isRoomDisabled = !form?.cinemaId || !hasRooms;

  const seatTypes = [
    {
      key: "Thường",
      label: "Ghế Thường",
      color: "text-gray-300",
      bg: "bg-gray-500/10",
      border: "border-gray-500/20",
    },
    {
      key: "VIP",
      label: "Ghế VIP",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      key: "Couple",
      label: "Ghế Couple",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
  ];

  const renderPriceSection = (
    title,
    subtitle,
    priceMap,
    onChange,
    toneClasses,
    locked = false,
    lockedBadgeText = "Không chỉnh tay"
  ) => (
    <div
      className={`p-4 rounded-xl border ${toneClasses.border} ${toneClasses.bg}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className={`text-sm font-semibold ${toneClasses.title}`}>
            {title}
          </h3>
          <p className="text-[10px] text-white/40 mt-1">{subtitle}</p>
        </div>
        {locked && (
          <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/45 border border-white/10">
            {lockedBadgeText}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {seatTypes.map((seat) => (
          <div
            key={`${title}-${seat.key}`}
            className={`rounded-xl border ${seat.border} ${seat.bg} p-3`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <label
                  className={`block text-sm font-medium ${seat.color} leading-5`}
                >
                  {seat.label}
                </label>
                <p className="text-[10px] text-white/35 mt-0.5">
                  {seat.key === "Thường"
                    ? "Giá chuẩn"
                    : seat.key === "VIP"
                    ? "Ghế cao cấp"
                    : "Ghế đôi"}
                </p>
              </div>
            </div>

            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                ₫
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                placeholder="0"
                value={formatVndWithCommas(priceMap?.[seat.key])}
                onChange={
                  locked
                    ? undefined
                    : (e) => onChange(seat.key, parseVndInput(e.target.value))
                }
                readOnly={locked}
                className={`w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition text-right tabular-nums ${
                  locked ? "cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg sm:max-w-2xl lg:max-w-5xl bg-cinema-surface border border-white/10 rounded-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white/70 mb-3">
                  Thông tin suất chiếu
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 relative">
                    <label className="block text-xs text-white/55 mb-1.5">
                      Phim *
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                        />
                        <input
                          ref={movieInputRef}
                          type="text"
                          value={searchMovieTerm}
                          onChange={(e) =>
                            handleMovieSearchChange(e.target.value)
                          }
                          onFocus={() => setShowMovieDropdown(true)}
                          placeholder="Gõ tên phim để tìm kiếm..."
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm outline-none focus:border-red-500/50 transition placeholder:text-white/30"
                        />
                        {searchMovieTerm && (
                          <button
                            onClick={() => {
                              handleMovieSearchChange("");
                              setForm({
                                ...form,
                                movieId: "",
                                movieTitle: "",
                                movieDuration: null,
                              });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <X
                              size={14}
                              className="text-white/35 hover:text-white/70"
                            />
                          </button>
                        )}
                      </div>

                      {showMovieDropdown && filteredMovies.length > 0 && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-50 mt-1 w-full bg-zinc-900 border border-white/10 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                        >
                          {filteredMovies.map((movie) => (
                            <button
                              key={movie.id}
                              onClick={() => handleMovieSelect(movie)}
                              className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white font-medium">
                                  {movie.title}
                                </span>
                                <span className="text-xs text-white/40">
                                  {movie.duration} phút
                                </span>
                              </div>
                              {movie.rating && (
                                <div className="text-xs text-white/30 mt-0.5">
                                  {movie.rating} • {movie.language || "Phụ đề"}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {showMovieDropdown &&
                        searchMovieTerm &&
                        filteredMovies.length === 0 && (
                          <div className="absolute z-50 mt-1 w-full bg-zinc-900 border border-white/10 rounded-lg shadow-xl p-4 text-center">
                            <p className="text-sm text-white/40">
                              Không tìm thấy phim "{searchMovieTerm}"
                            </p>
                          </div>
                        )}
                    </div>
                    {form?.movieId && (
                      <p className="text-[10px] text-green-400 mt-1">
                        ✓ Đã chọn: {form.movieTitle} • Thời lượng:{" "}
                        {form.movieDuration} phút
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-1.5">
                      Rạp chiếu *
                    </label>
                    <select
                      value={form?.cinemaId || ""}
                      onChange={(e) => handleCinemaChange(e.target.value)}
                      className={selectClass}
                      required
                    >
                      <option value="" className="bg-zinc-900 text-white/70">
                        Chọn rạp
                      </option>
                      {cinemas &&
                        cinemas.map((cinema) => {
                          const roomCount = cinema.rooms?.length || 0;
                          const maxRoomLimit = cinema.maxRooms || 4;
                          return (
                            <option
                              key={cinema.id}
                              value={cinema.id}
                              className="bg-zinc-900 text-white"
                            >
                              {cinema.name} ({roomCount}/{maxRoomLimit} phòng)
                            </option>
                          );
                        })}
                    </select>
                    {form?.cinemaId && selectedCinema && (
                      <p className="text-[10px] text-white/40 mt-1">
                        Rạp có {currentRoomCount}/{maxRooms} phòng
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-1.5">
                      Phòng chiếu *
                    </label>
                    <select
                      value={form?.roomId || ""}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className={selectClass}
                      disabled={isRoomDisabled}
                      required
                      style={{ opacity: isRoomDisabled ? 0.5 : 1 }}
                    >
                      <option value="" className="bg-zinc-900 text-white/70">
                        {!form?.cinemaId
                          ? "Chọn rạp trước"
                          : !hasRooms
                          ? "Rạp này chưa có phòng"
                          : "Chọn phòng"}
                      </option>
                      {availableRooms.map((room) => (
                        <option
                          key={room.id}
                          value={room.id}
                          className="bg-zinc-900 text-white"
                        >
                          {room.name} ({room.type} - {room.capacity || 100} ghế)
                        </option>
                      ))}
                    </select>
                    {form?.cinemaId && !hasRooms && (
                      <p className="text-[10px] text-yellow-400 mt-1">
                        ⚠️ Rạp này chưa có phòng chiếu. Vui lòng thêm phòng
                        trước.
                      </p>
                    )}
                    {form?.roomId && form?.type && (
                      <p className="text-[10px] text-blue-400 mt-1">
                        📍 Định dạng: {form.type} • Sức chứa: {form.totalSeats}{" "}
                        ghế
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white/70 mb-3">
                  Lịch chiếu
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-white/55 mb-1.5">
                      Ngày chiếu *
                    </label>
                    <input
                      type="date"
                      value={form?.date || ""}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setForm({ ...form, date: newDate });
                      }}
                      className={inputClass}
                      min={getTodayDate()}
                      required
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-1.5">
                      Giờ bắt đầu *
                    </label>
                    <input
                      type="time"
                      value={form?.time || ""}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className={inputClass}
                      required
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-1.5">
                      Giờ kết thúc
                    </label>
                    <div
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${
                        form?.endTime && form.endTime.includes("ngày hôm sau")
                          ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
                          : "text-white bg-zinc-900 border-white/10"
                      }`}
                    >
                      {form?.endTime ||
                        (form?.movieDuration
                          ? calculateEndTime()
                          : "Chọn phim và giờ bắt đầu")}
                    </div>
                    {form?.movieDuration && (
                      <p className="text-[10px] text-blue-400 mt-1">
                        ⏱️ {form.movieDuration} phút + 15 phút quảng cáo
                        {form?.endTime &&
                          form.endTime.includes("ngày hôm sau") && (
                            <span className="text-yellow-400 ml-2">
                              📅 Qua ngày
                            </span>
                          )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs text-white/55 mb-1.5">
                      Định dạng
                    </label>
                    <div
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${
                        form?.type ? "text-white" : "text-white/40"
                      } bg-zinc-900 border-white/10`}
                    >
                      {form?.type || "Chưa chọn phòng"}
                    </div>
                    {!form?.isSpecial &&
                      form?.type &&
                      form?.regularPricingError && (
                        <p className="text-[10px] text-yellow-400 mt-1">
                          ⚠️ Định dạng này chưa có quy tắc giá vé.
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-1.5">
                      Số ghế
                    </label>
                    <div className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                      {form?.totalSeats || 0} ghế
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white/70 mb-3">
                  Loại & giá vé
                </div>

                <label className="block text-xs text-white/55 mb-1.5">
                  <Sparkles size={12} className="inline mr-1 text-yellow-400" />
                  Loại suất chiếu *
                </label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleSpecialToggle(false);
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      !form?.isSpecial
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                        : "bg-zinc-900 text-gray-400 hover:text-white border border-white/10 hover:bg-zinc-800"
                    }`}
                  >
                    Suất chiếu thường
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSpecialToggle(true);
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      form?.isSpecial
                        ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/30"
                        : "bg-zinc-900 text-gray-400 hover:text-white border border-white/10 hover:bg-zinc-800"
                    }`}
                  >
                    <Sparkles size={12} className="inline mr-1" />
                    Suất chiếu đặc biệt
                  </button>
                </div>

                {!form?.isSpecial && (
                  <p className="text-[10px] text-green-400 flex items-center gap-1 mb-2">
                    ✓ Giá vé tự động theo bảng giá (loại ghế, loại rạp, giờ
                    chiếu)
                  </p>
                )}

                {!form?.isSpecial && form?.regularPricingError && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1 mb-2">
                    ✕ {form.regularPricingError}
                  </p>
                )}

                {form?.isSpecial && (
                  <div className="space-y-3 mb-3">
                    <p className="text-[10px] text-yellow-400 flex items-center gap-1">
                      <Sparkles size={10} />
                      Nhập giá vé đặc biệt theo từng loại ghế
                    </p>

                    <div>
                      <label className="block text-xs text-white/55 mb-1.5">
                        Loại giá vé (từ trang Giá vé)
                      </label>
                      <select
                        value={form?.specialPricingRuleId || ""}
                        onChange={(e) =>
                          handleHolidayRuleSelect(e.target.value)
                        }
                        className={selectClass}
                        disabled={holidayPricingLoading}
                      >
                        <option value="" className="bg-zinc-900 text-white/70">
                          {holidayPricingLoading
                            ? "Đang tải..."
                            : "Chọn loại giá vé đặc biệt"}
                        </option>
                        {holidayRuleOptions.map((rule) => (
                          <option
                            key={rule.id}
                            value={rule.id}
                            className="bg-zinc-900 text-white"
                          >
                            {rule.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-white/35 mt-1">
                        Chọn để tự đổ giá vào mục bên dưới.
                      </p>
                    </div>
                  </div>
                )}

                {!form?.isSpecial &&
                  renderPriceSection(
                    "Giá suất chiếu thường",
                    "Tự động áp dụng từ bảng giá (không chỉnh tay)",
                    pricingLoading || form?.regularPricingError
                      ? null
                      : form?.regularPrices,
                    handlePriceChange,
                    {
                      bg: "bg-green-500/5",
                      border: "border-green-500/15",
                      title: "text-green-300",
                    },
                    true,
                    pricingLoading
                      ? "Đang tải..."
                      : form?.regularPricingError
                      ? "Chưa có quy tắc"
                      : "Tự động"
                  )}

                {form?.isSpecial ? (
                  <div className="mt-4">
                    {renderPriceSection(
                      "Giá suất chiếu đặc biệt",
                      "Tự động theo loại giá vé đã chọn (không chỉnh tay)",
                      form?.specialPrices || null,
                      handleSpecialPriceChange,
                      {
                        bg: "bg-yellow-500/5",
                        border: "border-yellow-500/15",
                        title: "text-yellow-300",
                      },
                      true,
                      form?.specialPrices
                        ? form?.specialPricingRuleId
                          ? "Tự động"
                          : "Đã có giá"
                        : form?.specialPricingRuleId
                        ? "Chưa có giá"
                        : "Chưa chọn loại giá"
                    )}
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl border border-gray-500/15 bg-gray-500/5 opacity-70">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-300">
                          Giá suất chiếu đặc biệt
                        </h3>
                        <p className="text-[10px] text-white/40 mt-0.5">
                          Chọn "Suất chiếu đặc biệt" để bật
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/45 border border-white/10">
                        Đã khóa
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-blue-400 mt-3 flex items-center gap-1">
                  💡 Giá thường và giá đặc biệt được lưu riêng để tránh trộn dữ
                  liệu.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white/70 mb-3">
                  Trạng thái
                </div>
                <label className="block text-xs text-white/55 mb-1.5">
                  Trạng thái
                </label>
                <select
                  value={form?.status || "scheduled"}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={selectClass}
                >
                  <option
                    value="scheduled"
                    className="bg-zinc-900 text-green-400"
                  >
                    Sắp chiếu
                  </option>
                  <option
                    value="ongoing"
                    className="bg-zinc-900 text-yellow-400"
                  >
                    Đang chiếu
                  </option>
                  <option value="ended" className="bg-zinc-900 text-gray-400">
                    Đã kết thúc
                  </option>
                  <option
                    value="cancelled"
                    className="bg-zinc-900 text-red-400"
                  >
                    Hủy
                  </option>
                </select>

                {form?.roomId && form?.type && form?.totalSeats > 0 && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-blue-400 mb-1">
                      <span>🎬</span>
                      <span>Thông tin phòng chiếu</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-white/50">Phòng:</span>
                        <span className="text-white ml-2">{form.roomName}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Định dạng:</span>
                        <span className="text-white ml-2">{form.type}</span>
                      </div>
                      <div>
                        <span className="text-white/50">Sức chứa:</span>
                        <span className="text-white ml-2">
                          {form.totalSeats} ghế
                        </span>
                      </div>
                      <div>
                        <span className="text-white/50">Rạp:</span>
                        <span className="text-white ml-2">
                          {form.cinemaName}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={
              loading ||
              !form?.movieId ||
              !form?.cinemaId ||
              !form?.roomId ||
              !form?.date ||
              !form?.time ||
              (!form?.isSpecial && Boolean(form?.regularPricingError)) ||
              (form?.isSpecial && !form?.specialPrices)
            }
            className={`flex-1 py-2.5 rounded-lg text-white text-sm font-medium transition ${
              loading ||
              !form?.movieId ||
              !form?.cinemaId ||
              !form?.roomId ||
              !form?.date ||
              !form?.time ||
              (!form?.isSpecial && Boolean(form?.regularPricingError)) ||
              (form?.isSpecial && !form?.specialPrices)
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={
              form?.isSpecial && !form?.specialPrices
                ? "Vui lòng chọn giá ngày lễ trước khi thêm"
                : !form?.isSpecial && form?.regularPricingError
                ? form.regularPricingError
                : !form?.isSpecial && !form?.regularPrices
                ? "Đang tải giá..."
                : ""
            }
          >
            {loading ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm suất"}
          </button>
        </div>
      </div>
    </div>
  );
}
