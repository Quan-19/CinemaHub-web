import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  LogOut,
  ShieldCheck,
  Phone,
  Calendar,
  Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const today = new Date();
const maxDob = new Date(
  today.getFullYear() - 5,
  today.getMonth(),
  today.getDate()
)
  .toISOString()
  .split("T")[0];
const minDob = new Date(
  today.getFullYear() - 120,
  today.getMonth(),
  today.getDate()
)
  .toISOString()
  .split("T")[0];

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dobError, setDobError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing data from Firestore
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.phone) setPhone(data.phone);
          if (data.dob) setDob(data.dob);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (val && !/^0\d{9}$/.test(val)) {
      setPhoneError("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
    } else {
      setPhoneError("");
    }
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    setDob(val);
    if (val < minDob || val > maxDob) {
      setDobError("Ngày sinh không hợp lệ");
    } else {
      setDobError("");
    }
  };

  const handleSave = async () => {
    if (phoneError || dobError) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { phone, dob, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Lưu thất bại", err);
    } finally {
      setSaving(false);
    }
  };

  const provider = user.providerData?.[0]?.providerId ?? "password";
  const providerLabel =
    provider === "google.com" ? "Google" : "Email / Mật khẩu";

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <p className="text-zinc-400 text-sm">Đang tải...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "#0a0a0f" }}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Avatar & Name */}
        <div
          className="rounded-2xl border border-zinc-700 p-6 flex items-center gap-5"
          style={{ background: "#12121f" }}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "avatar"}
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-full object-cover border-2 border-zinc-700 shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-cinema-primary/80 flex items-center justify-center border-2 border-zinc-700 shrink-0">
              <User className="h-9 w-9 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xl font-bold truncate">
              {user.displayName ?? "Người dùng"}
            </p>
            <p className="text-zinc-400 text-sm mt-0.5 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Info rows */}
        <div
          className="rounded-2xl border border-zinc-700 divide-y divide-zinc-800"
          style={{ background: "#12121f" }}
        >
          <div className="flex items-center gap-4 px-5 py-4">
            <User className="h-4 w-4 text-zinc-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-zinc-400 text-xs mb-0.5">Tên hiển thị</p>
              <p className="text-white text-sm font-medium truncate">
                {user.displayName ?? "Chưa cập nhật"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-zinc-400 text-xs mb-0.5">Email</p>
              <p className="text-white text-sm font-medium truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <ShieldCheck className="h-4 w-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-zinc-400 text-xs mb-0.5">
                Phương thức đăng nhập
              </p>
              <p className="text-white text-sm font-medium">{providerLabel}</p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div
          className="rounded-2xl border border-zinc-700 divide-y divide-zinc-800"
          style={{ background: "#12121f" }}
        >
          {/* Phone */}
          <div className="px-5 py-4">
            <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
              <Phone className="h-3.5 w-3.5 text-cinema-primary" />
              Số điện thoại
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="0xxxxxxxxx"
              maxLength={10}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-400 focus:border-cinema-primary focus:ring-1 focus:ring-cinema-primary/40 transition-colors"
            />
            {phoneError && (
              <p className="mt-1.5 text-xs text-red-400">{phoneError}</p>
            )}
          </div>

          {/* Date of birth */}
          <div className="px-5 py-4">
            <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
              <Calendar className="h-3.5 w-3.5 text-cinema-primary" />
              Ngày sinh
            </label>
            <input
              type="date"
              value={dob}
              onChange={handleDobChange}
              min={minDob}
              max={maxDob}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white outline-none focus:border-cinema-primary focus:ring-1 focus:ring-cinema-primary/40 transition-colors"
              style={{ colorScheme: "dark" }}
            />
            {dobError && (
              <p className="mt-1.5 text-xs text-red-400">{dobError}</p>
            )}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !!phoneError || !!dobError}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
            saved
              ? "bg-emerald-700 text-white"
              : saving
              ? "bg-cinema-primary/60 text-white/70 cursor-not-allowed"
              : "bg-cinema-primary text-white hover:bg-cinema-primary-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
