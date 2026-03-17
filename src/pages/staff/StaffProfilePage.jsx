import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Building2, Mail, Phone, Save, User } from "lucide-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../../firebase/firebaseConfig";

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
  const [saved, setSaved] = useState(false);

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

    const staffRef = doc(db, "staffs", user.uid);
    getDoc(staffRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.phone) setPhone(normalizePhone(data.phone));
          if (data.cinemaId) setCinemaId(String(data.cinemaId));
          if (data.cinemaName) setCinemaName(String(data.cinemaName));
        }
      })
      .finally(() => setLoading(false));
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
      const staffRef = doc(db, "staffs", user.uid);
      await setDoc(
        staffRef,
        {
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? "Nhân viên",
          phone,
          cinemaId,
          cinemaName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Lưu staff thất bại", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Hồ sơ nhân viên</h1>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>

        <div className="cinema-surface p-5">
          <p className="text-sm text-zinc-300">
            Bạn chưa đăng nhập. Hãy đăng nhập để xem và cập nhật hồ sơ nhân
            viên.
          </p>
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="cinema-btn-primary mt-4"
          >
            Đi tới trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cinema-surface p-5">
        <p className="text-sm text-zinc-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Hồ sơ nhân viên</h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>

      <div className="cinema-surface p-5">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "avatar"}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover border border-zinc-700 shrink-0"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-zinc-100 ring-1 ring-zinc-700">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">
              {user.displayName ?? "Nhân viên"}
            </div>
            <div className="truncate text-sm text-zinc-400">{user.email}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
            <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
              <User className="h-3.5 w-3.5 text-cinema-primary" />
              Tên hiển thị
            </label>
            <div className="text-sm text-zinc-100">
              {user.displayName ?? "Chưa cập nhật"}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
            <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
              <Mail className="h-3.5 w-3.5 text-cinema-primary" />
              Email
            </label>
            <div className="text-sm text-zinc-100">{user.email}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cinema-primary focus:ring-1 focus:ring-cinema-primary/40 transition-colors"
            />
            {phoneError ? (
              <p className="mt-1.5 text-xs text-red-400">{phoneError}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
            <label className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-2">
              <Building2 className="h-3.5 w-3.5 text-cinema-primary" />
              Rạp
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={cinemaName}
                onChange={(e) => setCinemaName(e.target.value)}
                placeholder="Tên rạp"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cinema-primary focus:ring-1 focus:ring-cinema-primary/40 transition-colors"
              />
              <input
                value={cinemaId}
                onChange={(e) => setCinemaId(e.target.value)}
                placeholder="Mã rạp"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cinema-primary focus:ring-1 focus:ring-cinema-primary/40 transition-colors"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Thông tin này sẽ được lưu trong collection{" "}
              <span className="font-semibold text-zinc-300">staffs</span>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !!phoneError}
          className={[
            "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
            saved
              ? "bg-emerald-700 text-white"
              : saving
              ? "bg-cinema-primary/60 text-white/70 cursor-not-allowed"
              : "bg-cinema-primary text-white hover:bg-cinema-primary-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

export default StaffProfilePage;
