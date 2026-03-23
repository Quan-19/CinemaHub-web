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
      vip: 120000
    },
    "3D": {
      adult: 110000,
      child: 90000,
      student: 95000,
      vip: 150000
    },
    "IMAX": {
      adult: 150000,
      child: 130000,
      student: 135000,
      vip: 200000
    },
    "4DX": {
      adult: 180000,
      child: 160000,
      student: 165000,
      vip: 240000
    }
  },
  
  // Giá vé cuối tuần (Thứ 6,7,CN)
  weekend: {
    "2D": {
      adult: 100000,
      child: 80000,
      student: 85000,
      vip: 140000
    },
    "3D": {
      adult: 120000,
      child: 100000,
      student: 105000,
      vip: 170000
    },
    "IMAX": {
      adult: 170000,
      child: 150000,
      student: 155000,
      vip: 230000
    },
    "4DX": {
      adult: 200000,
      child: 180000,
      student: 185000,
      vip: 270000
    }
  }
};

// Định nghĩa các loại suất chiếu đặc biệt với giá thực tế
export const SPECIAL_TYPES = [
  { 
    value: "premiere", 
    label: "Suất chiếu ra mắt", 
    color: "#e50914", 
    icon: "🎬", 
    description: "Suất chiếu sớm trước ngày công chiếu chính thức",
    priceMultiplier: 1.3, // Tăng 30% (phụ thu phòng vé)
    availableFormats: ["2D", "IMAX", "4DX"]
  },
  { 
    value: "holiday", 
    label: "Suất chiếu ngày lễ", 
    color: "#f59e0b", 
    icon: "🎉", 
    description: "Áp dụng cho các ngày lễ, Tết",
    priceMultiplier: 1.2, // Tăng 20% (giá ngày lễ)
    availableFormats: ["2D", "3D", "IMAX", "4DX"]
  },
  { 
    value: "event", 
    label: "Suất chiếu sự kiện", 
    color: "#8b5cf6", 
    icon: "🎪", 
    description: "Suất chiếu đặc biệt có giao lưu, quà tặng",
    priceMultiplier: 1.5, // Tăng 50% (bao gồm quà tặng)
    availableFormats: ["2D", "IMAX"]
  },
  { 
    value: "midnight", 
    label: "Suất chiếu đêm", 
    color: "#3b82f6", 
    icon: "🌙", 
    description: "Suất chiếu sau 23:00",
    priceMultiplier: 0.8, // Giảm 20% (giá khuya)
    availableFormats: ["2D", "3D"]
  },
  { 
    value: "vip", 
    label: "Suất chiếu VIP", 
    color: "#f43f5e", 
    icon: "👑", 
    description: "Ghế ngồi VIP, đồ uống miễn phí",
    priceMultiplier: 2.0, // Tăng 100% (dịch vụ VIP)
    availableFormats: ["2D", "IMAX"]
  },
  { 
    value: "couple", 
    label: "Suất chiếu đôi", 
    color: "#ec4899", 
    icon: "💑", 
    description: "Ghế đôi dành cho các cặp đôi",
    priceMultiplier: 1.8, // Tăng 80% (giá vé đôi)
    availableFormats: ["2D"]
  },
  { 
    value: "early", 
    label: "Suất chiếu sớm", 
    color: "#10b981", 
    icon: "🌅", 
    description: "Suất chiếu trước 12:00 trưa",
    priceMultiplier: 0.7, // Giảm 30% (giá sáng sớm)
    availableFormats: ["2D", "3D"]
  },
  { 
    value: "sweetbox", 
    label: "Sweetbox", 
    color: "#f97316", 
    icon: "🍿", 
    description: "Combo vé + bỏng nước",
    priceMultiplier: 1.4, // Tăng 40% (bao gồm đồ ăn)
    availableFormats: ["2D"]
  }
];

const MOVIES = [
  { id: "MV001", title: "Biệt Đội Chiến Thần", duration: 150, rating: "C16", poster: "/posters/biet-doi-chien-than.jpg" },
  { id: "MV002", title: "Hành Trình Vũ Trụ", duration: 135, rating: "P", poster: "/posters/hanh-trinh-vu-tru.jpg" },
  { id: "MV003", title: "Bóng Đêm Vĩnh Cửu", duration: 120, rating: "C18", poster: "/posters/bong-dem-vinh-cuu.jpg" },
];

const CINEMAS = [
  { 
    id: "C001", 
    name: "CGV Vincom Bà Triệu", 
    rooms: [
      { id: "R001", name: "Phòng 1", type: "2D", capacity: 120, hasVip: true },
      { id: "R002", name: "Phòng 2", type: "2D", capacity: 90, hasVip: true },
      { id: "R003", name: "IMAX 1", type: "IMAX", capacity: 168, hasVip: true },
    ]
  },
  { 
    id: "C002", 
    name: "CGV Aeon Mall Hà Đông", 
    rooms: [
      { id: "R004", name: "Phòng 1", type: "3D", capacity: 120, hasVip: true },
      { id: "R005", name: "4DX Hall", type: "4DX", capacity: 80, hasVip: true },
    ]
  },
  { 
    id: "C003", 
    name: "Galaxy Nguyễn Du", 
    rooms: [
      { id: "R006", name: "Phòng 1", type: "2D", capacity: 150, hasVip: true },
      { id: "R007", name: "Phòng 2", type: "3D", capacity: 120, hasVip: true },
    ]
  }
];

// Mock data với giá vé thực tế
const mockShowtimes = [
  { 
    id: "ST001", 
    movieId: "MV001",
    movieTitle: "Biệt Đội Chiến Thần", 
    moviePoster: "/posters/biet-doi-chien-than.jpg",
    cinemaId: "C001",
    cinemaName: "CGV Vincom Bà Triệu", 
    roomId: "R001",
    roomName: "Phòng 1", 
    date: "2026-03-20", 
    time: "09:00", 
    endTime: "11:30",
    type: "2D", 
    availableSeats: 87, 
    totalSeats: 120, 
    price: PRICE_CONFIG.early["2D"],
    status: "ended",
    special: true,
    specialType: "early",
    bookedCount: 33,
    revenue: 2805000
  },
  { 
    id: "ST002", 
    movieId: "MV001",
    movieTitle: "Biệt Đội Chiến Thần", 
    moviePoster: "/posters/biet-doi-chien-than.jpg",
    cinemaId: "C001",
    cinemaName: "CGV Vincom Bà Triệu", 
    roomId: "R003",
    roomName: "IMAX 1", 
    date: "2026-03-20", 
    time: "11:30", 
    endTime: "14:00",
    type: "IMAX", 
    availableSeats: 120, 
    totalSeats: 168, 
    price: PRICE_CONFIG.standard.IMAX,
    status: "ended",
    special: false,
    specialType: null,
    bookedCount: 48,
    revenue: 7200000
  },
  { 
    id: "ST003", 
    movieId: "MV002",
    movieTitle: "Hành Trình Vũ Trụ", 
    moviePoster: "/posters/hanh-trinh-vu-tru.jpg",
    cinemaId: "C002",
    cinemaName: "CGV Aeon Mall Hà Đông", 
    roomId: "R004",
    roomName: "Phòng 1", 
    date: "2026-03-20", 
    time: "14:00", 
    endTime: "16:15",
    type: "3D", 
    availableSeats: 43, 
    totalSeats: 120, 
    price: PRICE_CONFIG.standard["3D"],
    status: "ongoing",
    special: false,
    specialType: null,
    bookedCount: 77,
    revenue: 8470000
  },
  { 
    id: "ST004", 
    movieId: "MV003",
    movieTitle: "Bóng Đêm Vĩnh Cửu", 
    moviePoster: "/posters/bong-dem-vinh-cuu.jpg",
    cinemaId: "C001",
    cinemaName: "CGV Vincom Bà Triệu", 
    roomId: "R002",
    roomName: "Phòng 2", 
    date: "2026-03-20", 
    time: "19:30", 
    endTime: "21:30",
    type: "2D", 
    availableSeats: 55, 
    totalSeats: 90, 
    price: PRICE_CONFIG.weekend["2D"],
    status: "scheduled",
    special: true,
    specialType: "weekend",
    bookedCount: 35,
    revenue: 3500000
  },
  { 
    id: "ST005", 
    movieId: "MV001",
    movieTitle: "Biệt Đội Chiến Thần", 
    moviePoster: "/posters/biet-doi-chien-than.jpg",
    cinemaId: "C002",
    cinemaName: "CGV Aeon Mall Hà Đông", 
    roomId: "R005",
    roomName: "4DX Hall", 
    date: "2026-03-21", 
    time: "23:30", 
    endTime: "02:00",
    type: "4DX", 
    availableSeats: 60, 
    totalSeats: 80, 
    price: PRICE_CONFIG.standard["4DX"],
    status: "scheduled",
    special: true,
    specialType: "midnight",
    bookedCount: 20,
    revenue: 2880000
  },
  { 
    id: "ST006", 
    movieId: "MV002",
    movieTitle: "Hành Trình Vũ Trụ", 
    moviePoster: "/posters/hanh-trinh-vu-tru.jpg",
    cinemaId: "C003",
    cinemaName: "Galaxy Nguyễn Du", 
    roomId: "R006",
    roomName: "Phòng 1", 
    date: "2026-03-22", 
    time: "20:00", 
    endTime: "22:15",
    type: "2D", 
    availableSeats: 45, 
    totalSeats: 150, 
    price: PRICE_CONFIG.weekend["2D"],
    status: "scheduled",
    special: true,
    specialType: "couple",
    bookedCount: 105,
    revenue: 9450000
  }
];

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState(mockShowtimes);
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
  
  const itemsPerPage = 10;

  // Hàm xác định giá vé dựa trên ngày và giờ
  const getBasePriceByTime = (date, time, type) => {
    const showDate = new Date(date);
    const dayOfWeek = showDate.getDay(); // 0: Chủ nhật, 6: Thứ 7
    const hour = parseInt(time.split(':')[0]);
    
    // Kiểm tra ngày cuối tuần (Thứ 6,7, CN)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;
    
    // Giá theo khung giờ
    if (hour < 12) {
      // Suất sớm - giá thấp hơn
      return PRICE_CONFIG.early || PRICE_CONFIG.standard;
    } else if (hour >= 23) {
      // Suất đêm - giá thấp hơn
      return PRICE_CONFIG.midnight || PRICE_CONFIG.standard;
    } else if (isWeekend) {
      // Cuối tuần - giá cao hơn
      return PRICE_CONFIG.weekend[type] || PRICE_CONFIG.standard[type];
    } else {
      // Ngày thường
      return PRICE_CONFIG.standard[type] || PRICE_CONFIG.standard["2D"];
    }
  };

  // Tính giá vé dựa trên loại suất chiếu đặc biệt
  const calculateSpecialPrice = (basePrice, specialType, format) => {
    const special = SPECIAL_TYPES.find(t => t.value === specialType);
    if (!special) return basePrice;
    
    // Kiểm tra format có hỗ trợ không
    if (!special.availableFormats.includes(format)) {
      return basePrice; // Không hỗ trợ format này thì giữ giá gốc
    }
    
    return {
      adult: Math.round(basePrice.adult * special.priceMultiplier / 1000) * 1000,
      child: Math.round(basePrice.child * special.priceMultiplier / 1000) * 1000,
      student: Math.round(basePrice.student * special.priceMultiplier / 1000) * 1000,
      vip: Math.round(basePrice.vip * special.priceMultiplier / 1000) * 1000
    };
  };

  // Lọc dữ liệu nâng cao
  const filtered = showtimes.filter(s => {
    // Tìm kiếm
    const matchSearch = search === "" || 
      s.movieTitle.toLowerCase().includes(search.toLowerCase()) || 
      s.cinemaName.toLowerCase().includes(search.toLowerCase()) ||
      s.roomName.toLowerCase().includes(search.toLowerCase());
    
    // Lọc theo rạp
    const matchCinema = cinemaFilter === "all" || s.cinemaId === cinemaFilter;
    
    // Lọc theo loại đặc biệt
    const matchSpecial = specialFilter === "all" || 
      (specialFilter === "special" && s.special) ||
      (specialFilter !== "special" && s.specialType === specialFilter);
    
    // Lọc theo ngày (thông minh)
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
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
    
    // Lọc theo trạng thái
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    
    return matchSearch && matchCinema && matchDate && matchStatus && matchSpecial;
  });

  // Tự động cập nhật trạng thái suất chiếu dựa vào thời gian thực
  useEffect(() => {
    const interval = setInterval(() => {
      setShowtimes(prev => prev.map(showtime => {
        const now = new Date();
        const showDate = new Date(`${showtime.date}T${showtime.time}`);
        const endDate = new Date(`${showtime.date}T${showtime.endTime || addHours(showtime.time, 2)}`);
        
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
      }));
    }, 60000); // Cập nhật mỗi phút
    
    return () => clearInterval(interval);
  }, []);

  const addHours = (time, hours) => {
    const [h, m] = time.split(':').map(Number);
    return `${String(h + hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Kiểm tra xung đột lịch chiếu
  const checkConflict = (newShowtime) => {
    const conflicts = showtimes.filter(s => 
      s.cinemaId === newShowtime.cinemaId &&
      s.roomId === newShowtime.roomId &&
      s.date === newShowtime.date &&
      s.id !== newShowtime.id &&
      s.status !== "cancelled"
    );

    for (let existing of conflicts) {
      const existingStart = new Date(`${existing.date}T${existing.time}`);
      const existingEnd = new Date(`${existing.date}T${existing.endTime || addHours(existing.time, 2)}`);
      const newStart = new Date(`${newShowtime.date}T${newShowtime.time}`);
      const newEnd = new Date(`${newShowtime.date}T${newShowtime.endTime || addHours(newShowtime.time, 2)}`);
      
      if (newStart < existingEnd && newEnd > existingStart) {
        return {
          conflict: true,
          with: existing
        };
      }
    }
    
    return { conflict: false };
  };

  // Tính end time dựa trên thời lượng phim
  const calculateEndTime = (movieId, startTime) => {
    const movie = MOVIES.find(m => m.id === movieId);
    if (!movie) return addHours(startTime, 2);
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + movie.duration + 15; // Thêm 15 phút quảng cáo
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleAdd = () => {
    setEditingShowtime(null);
    const defaultTime = "10:00";
    const basePrice = getBasePriceByTime(
      new Date().toISOString().split('T')[0],
      defaultTime,
      CINEMAS[0].rooms[0].type
    );
    
    setForm({
      movieId: MOVIES[0].id,
      movieTitle: MOVIES[0].title,
      cinemaId: CINEMAS[0].id,
      cinemaName: CINEMAS[0].name,
      roomId: CINEMAS[0].rooms[0].id,
      roomName: CINEMAS[0].rooms[0].name,
      date: new Date().toISOString().split('T')[0],
      time: defaultTime,
      endTime: calculateEndTime(MOVIES[0].id, defaultTime),
      type: CINEMAS[0].rooms[0].type,
      totalSeats: CINEMAS[0].rooms[0].capacity,
      availableSeats: CINEMAS[0].rooms[0].capacity,
      price: basePrice,
      special: false,
      specialType: null,
      status: "scheduled",
      bookedCount: 0,
      revenue: 0
    });
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
      // Tính giá cơ bản dựa trên thời gian
      const basePrice = getBasePriceByTime(
        formData.date,
        formData.time,
        formData.type
      );
      
      // Tính giá đặc biệt nếu có
      let finalPrice = basePrice;
      if (formData.special && formData.specialType) {
        finalPrice = calculateSpecialPrice(
          basePrice,
          formData.specialType,
          formData.type
        );
      }

      // Tính end time dựa trên phim đã chọn
      const endTime = calculateEndTime(formData.movieId, formData.time);
      const formWithEndTime = { 
        ...formData, 
        endTime,
        price: finalPrice
      };

      // Kiểm tra xung đột
      const { conflict, with: conflictingShow } = checkConflict(formWithEndTime);
      
      if (conflict) {
        const confirm = window.confirm(
          `Suất chiếu này xung đột với "${conflictingShow.movieTitle}" lúc ${conflictingShow.time}. Bạn có muốn tiếp tục?`
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingShowtime) {
        setShowtimes(prev =>
          prev.map(s => s.id === editingShowtime.id ? { ...s, ...formWithEndTime } : s)
        );
        toast.success("Cập nhật suất chiếu thành công!");
      } else {
        const newShowtime = {
          id: `ST${Date.now()}`,
          ...formWithEndTime,
          availableSeats: formWithEndTime.totalSeats,
          bookedCount: 0,
          revenue: 0,
          status: "scheduled",
        };
        setShowtimes(prev => [newShowtime, ...prev]);
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
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowtimes(prev => prev.filter(s => s.id !== id));
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
      date: new Date().toISOString().split('T')[0],
      status: "scheduled",
      bookedCount: 0,
      revenue: 0,
      availableSeats: showtime.totalSeats
    };
    
    setShowtimes(prev => [newShowtime, ...prev]);
    toast.success("Đã nhân bản suất chiếu!");
  };

  const handleBulkDelete = async () => {
    if (selectedShowtimes.length === 0) return;
    
    const confirm = window.confirm(`Bạn có chắc muốn xóa ${selectedShowtimes.length} suất chiếu?`);
    if (!confirm) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowtimes(prev => prev.filter(s => !selectedShowtimes.includes(s.id)));
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
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowtimes(prev =>
        prev.map(s => 
          selectedShowtimes.includes(s.id) ? { ...s, status: newStatus } : s
        )
      );
      setSelectedShowtimes([]);
      toast.success(`Đã cập nhật trạng thái ${selectedShowtimes.length} suất chiếu`);
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
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowtimes(prev =>
        prev.map(s => {
          if (selectedShowtimes.includes(s.id)) {
            const newSpecial = specialType !== "none";
            
            // Tính lại giá dựa trên loại suất mới
            const basePrice = getBasePriceByTime(s.date, s.time, s.type);
            const newPrice = newSpecial ? 
              calculateSpecialPrice(basePrice, specialType, s.type) : 
              basePrice;
            
            return { 
              ...s, 
              special: newSpecial,
              specialType: newSpecial ? specialType : null,
              price: newPrice
            };
          }
          return s;
        })
      );
      setSelectedShowtimes([]);
      toast.success(`Đã cập nhật loại suất chiếu cho ${selectedShowtimes.length} suất`);
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    switch(type) {
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'print':
        printSchedule();
        break;
      default:
        toast.success(`Đang xuất file ${type}...`);
    }
  };

  const exportToExcel = () => {
    // Tạo dữ liệu cho Excel
    const exportData = filtered.map(s => {
      const specialType = SPECIAL_TYPES.find(t => t.value === s.specialType);
      return {
        'Tên phim': s.movieTitle,
        'Rạp': s.cinemaName,
        'Phòng': s.roomName,
        'Ngày': s.date,
        'Giờ': s.time,
        'Định dạng': s.type,
        'Loại suất': s.special ? (specialType?.label || 'Đặc biệt') : 'Thường',
        'Ghế trống': `${s.availableSeats}/${s.totalSeats}`,
        'Giá vé (người lớn)': `${s.price.adult?.toLocaleString()}đ`,
        'Giá vé (trẻ em)': `${s.price.child?.toLocaleString()}đ`,
        'Giá vé (sinh viên)': `${s.price.student?.toLocaleString()}đ`,
        'Giá vé (VIP)': `${s.price.vip?.toLocaleString()}đ`,
        'Trạng thái': statusConfig[s.status]?.label || s.status,
        'Đã bán': s.bookedCount,
        'Doanh thu': `${s.revenue?.toLocaleString()}đ`
      };
    });

    // Tạo CSV content
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `suat-chieu-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Xuất file Excel thành công!');
  };

  const exportToPDF = () => {
    window.print();
    toast.success('Đã mở trang in, bạn có thể lưu dưới dạng PDF');
  };

  const printSchedule = () => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('vi-VN');
    
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
          <p>Suất đặc biệt: ${filtered.filter(s => s.special).length} suất</p>
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
              ${filtered.map(s => {
                const specialType = SPECIAL_TYPES.find(t => t.value === s.specialType);
                return `
                <tr>
                  <td><strong>${s.movieTitle}</strong></td>
                  <td>${s.cinemaName}</td>
                  <td>${s.roomName}</td>
                  <td>${new Date(s.date).toLocaleDateString('vi-VN')}</td>
                  <td>${s.time}</td>
                  <td>${s.type}</td>
                  <td>
                    ${s.special ? `<span class="special-badge" style="background: ${specialType?.color}20; color: ${specialType?.color}">${specialType?.icon} ${specialType?.label}</span>` : 'Thường'}
                  </td>
                  <td>${s.availableSeats}/${s.totalSeats}</td>
                  <td class="price">${s.price.adult?.toLocaleString()}đ</td>
                  <td>${statusConfig[s.status]?.label || s.status}</td>
                </tr>
              `}).join('')}
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
  const availableDates = [...new Set(showtimes.map(s => s.date))].sort();

  // Hàm cập nhật form khi chọn phim/rạp/phòng
  const updateFormFromSelection = (updates) => {
    setForm(prev => {
      const newForm = { ...prev, ...updates };
      
      // Nếu chọn phim mới, cập nhật endTime
      if (updates.movieId) {
        newForm.endTime = calculateEndTime(updates.movieId, newForm.time);
      }
      
      // Nếu chọn rạp mới hoặc phòng mới, cập nhật thông tin phòng
      if (updates.cinemaId || updates.roomId) {
        const cinema = CINEMAS.find(c => c.id === newForm.cinemaId);
        if (cinema) {
          const room = cinema.rooms.find(r => r.id === newForm.roomId) || cinema.rooms[0];
          newForm.roomName = room.name;
          newForm.type = room.type;
          newForm.totalSeats = room.capacity;
          newForm.availableSeats = room.capacity;
        }
      }
      
      // Nếu thay đổi loại suất đặc biệt, cập nhật giá
      if (updates.specialType !== undefined) {
        newForm.special = updates.specialType !== "none";
        const basePrice = getBasePriceByTime(newForm.date, newForm.time, newForm.type);
        if (newForm.special) {
          newForm.price = calculateSpecialPrice(basePrice, updates.specialType, newForm.type);
        } else {
          newForm.price = basePrice;
        }
      }
      
      // Nếu thay đổi ngày hoặc giờ, cập nhật giá
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
        specialCount={showtimes.filter(s => s.special).length}
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
        cinemas={CINEMAS}
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

      {showModal && form && (
        <ShowtimeModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          form={form}
          setForm={updateFormFromSelection}
          isEdit={!!editingShowtime}
          movies={MOVIES}
          cinemas={CINEMAS}
          loading={loading}
          specialTypes={SPECIAL_TYPES}
          priceConfig={PRICE_CONFIG}
        />
      )}

      <QuickEditModal
        show={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        showtimes={showtimes.filter(s => selectedShowtimes.includes(s.id))}
        onSave={async (updates) => {
          setLoading(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setShowtimes(prev =>
              prev.map(s => 
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
  scheduled: { label: "Sắp chiếu", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  ongoing: { label: "Đang chiếu", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ended: { label: "Đã kết thúc", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};