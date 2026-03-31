import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  Building2,
  Mail,
  Phone,
  Save,
  User,
  ShieldCheck,
  MapPin,
  Camera,
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../../firebase/firebaseConfig";
import StaffSuccessToast from "../../components/staff/StaffSuccessToast.jsx";

function normalizePhone(phone) {
  return String(phone ?? "")
    .replace(/\D/g, "")
    .slice(0, 10);
}

function StaffProfilePage() {
  const { subtitle } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [cinemaId, setCinemaId] = useState("");
  const [cinemaName, setCinemaName] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [joinedDate, setJoinedDate] = useState("");

  const initials = useMemo(() => {
    const name = user?.displayName ?? "Nhân viên";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
    return letters.join("") || "NV";
  }, [user?.displayName]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Load extra data from backend
    const loadProfile = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.phone) setPhone(normalizePhone(data.phone));
          if (data.cinema_id) setCinemaId(String(data.cinema_id));
          if (data.created_at) setJoinedDate(data.created_at);
        }
      } catch (err) {
        console.error("Load backend profile failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handlePhoneChange = (e) => {
    const value = normalizePhone(e.target.value);
    setPhone(value);
    if (value && !/^0\d{9}$/.test(value)) {
      setPhoneError("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
    } else {
      setPhoneError("");
    }
  };

  const handleSave = async () => {
    if (!user || phoneError) return;
    setSaving(true);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          phone: phone,
          // name: user.displayName (Backend update-profile logic hiện tại chỉ nhận phone, dob)
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Lỗi từ Backend");
      }

      setToast({ type: "success", message: "Hồ sơ của bạn đã được cập nhật thành công." });
    } catch (err) {
      console.error("Lưu hồ sơ thất bại", err);
      setToast({ type: "error", message: `Lỗi: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cinema-primary border-t-transparent" />
          <p className="text-sm font-medium text-zinc-200">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
            <User className="h-12 w-12 text-zinc-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Bạn chưa đăng nhập</h1>
        <p className="mb-8 text-zinc-200">Vui lòng đăng nhập để truy cập thông tin nhân viên và các tính năng quản lý.</p>
        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="inline-flex items-center gap-2 rounded-2xl bg-cinema-primary px-8 py-3 font-semibold text-white transition-all hover:bg-cinema-primary-dark active:scale-95"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header section with Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900/40 shadow-2xl">
        {/* Banner Pattern */}
        <div className="h-32 w-full bg-gradient-to-r from-cinema-primary/20 via-indigo-600/10 to-cinema-primary/20 sm:h-40">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(239, 68, 68, 0.4) 1px, transparent 0)`, backgroundSize: '24px 24px' }}>
          </div>
        </div>

        <div className="relative -mt-12 px-6 pb-6 sm:-mt-16 sm:px-10 sm:pb-10">
          <div className="flex flex-col items-end justify-between gap-4 sm:flex-row">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
              <div className="relative group">
                <div className="h-24 w-24 overflow-hidden rounded-3xl border-4 border-zinc-950 bg-zinc-900 shadow-xl transition-transform duration-300 group-hover:scale-[1.02] sm:h-32 sm:w-32">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? "avatar"}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-cinema-primary">
                      {initials}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-zinc-400 border border-zinc-700 hover:text-white transition-colors shadow-lg">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center sm:mb-2 sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {user.displayName ?? "Nhân viên"}
                  </h1>
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-zinc-200 sm:justify-start font-medium">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider font-bold text-cinema-primary text-[10px] bg-cinema-primary/10 px-2 py-0.5 rounded-md border border-cinema-primary/20">
                    Staff Member
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !!phoneError}
              className={[
                "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold transition-all duration-300 sm:mb-2 shadow-lg",
                saving
                  ? "bg-cinema-primary/60 text-white/70 cursor-not-allowed"
                  : "bg-cinema-primary text-white hover:bg-cinema-primary-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-4 w-4" />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Stats & Meta */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-300">Thông tin rạp chiếu</h3>
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4 transition-colors hover:border-zinc-600">
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  <Building2 className="h-3.5 w-3.5 text-cinema-primary" />
                  Tên rạp quản lý
                </label>
                <input
                  value={cinemaName}
                  onChange={(e) => setCinemaName(e.target.value)}
                  placeholder="Nhập tên rạp..."
                  className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-400"
                />
              </div>

              <div className="rounded-2xl border border-zinc-700 bg-zinc-950/20 p-4 transition-colors hover:border-zinc-600">
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  <Building2 className="h-3.5 w-3.5 text-cinema-primary" />
                  Mã số rạp (ID)
                </label>
                <input
                  value={cinemaId}
                  onChange={(e) => setCinemaId(e.target.value)}
                  placeholder="Mã định danh rạp..."
                  className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-500/5 p-3 ring-1 ring-inset ring-indigo-500/10">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <p className="text-[11px] leading-relaxed text-zinc-300 font-medium">
                Dữ liệu rạp giúp hệ thống lọc đúng danh sách phim và suất chiếu bạn được phép quản lý.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-300">Trạng thái làm việc</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white uppercase tracking-tight">Đang hoạt động</div>
                <div className="text-[11px] text-zinc-200 font-medium">
                  {joinedDate
                    ? `Làm việc từ: ${new Date(joinedDate).toLocaleDateString("vi-VN")}`
                    : "Làm việc từ: 2024"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Info */}
        <div className="lg:col-span-2">
          <div className="h-full rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-sm sm:p-8">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-zinc-300">Thông tin chi tiết</h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Họ và tên
                </label>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-300 group-focus-within:text-cinema-primary transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    readOnly
                    value={user.displayName ?? ""}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/40 py-3.5 pl-11 pr-4 text-sm text-zinc-200 outline-none transition-all focus:border-cinema-primary/50 focus:ring-4 focus:ring-cinema-primary/5"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 px-2 py-0.5 text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">Read Only</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Địa chỉ Email
                </label>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-300 group-focus-within:text-cinema-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    readOnly
                    value={user.email ?? ""}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/40 py-3.5 pl-11 pr-4 text-sm text-zinc-200 outline-none transition-all focus:border-cinema-primary/50 focus:ring-4 focus:ring-cinema-primary/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Số điện thoại di động
                </label>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 group-focus-within:text-cinema-primary transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="Nhập số điện thoại liên hệ"
                    className={[
                      "w-full rounded-2xl border bg-zinc-800/60 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all focus:ring-4",
                      phoneError ? "border-red-500/50 focus:ring-red-500/5" : "border-zinc-700 focus:border-cinema-primary/50 focus:ring-cinema-primary/5"
                    ].join(" ")}
                  />
                  {phoneError ? (
                    <p className="mt-1.5 flex items-center gap-1.5 px-1 text-[11px] font-medium text-red-400">
                      <AlertCircle className="h-3 w-3" /> {phoneError}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Địa điểm cơ quan
                </label>
                <div className="group relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-300 group-focus-within:text-cinema-primary transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    readOnly
                    value={cinemaName || "Chưa thiết lập phòng làm việc"}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/40 py-3.5 pl-11 pr-4 text-sm text-zinc-200 outline-none transition-all focus:border-cinema-primary/50 focus:ring-4 focus:ring-cinema-primary/5"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-3xl bg-cinema-primary/5 p-6 ring-1 ring-inset ring-cinema-primary/10">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cinema-primary text-white shadow-lg shadow-cinema-primary/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Bảo mật tài khoản Staff</h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300 font-medium">
                    Tài khoản của bạn được áp dụng các chính sách bảo mật chuyên biệt cho nhân viên.
                    Mọi hành động thay đổi thông tin quan trọng đều được ghi nhận vào hệ thống log để đảm bảo an toàn cho rạp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <StaffSuccessToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

export default StaffProfilePage;
