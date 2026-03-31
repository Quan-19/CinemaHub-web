import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Film, Lock, Mail, Phone, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

function PasswordInput({ value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
        <Lock className="h-4 w-4" />
      </span>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 pl-10 pr-10 text-sm text-white placeholder:text-zinc-400 focus:border-cinema-primary focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LoginForm({ onSuccess, notice }) {
  const { loginWithEmail, loginWithGoogle, resendEmailVerification } =
    useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice ?? "");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    setInfo(notice ?? "");
  }, [notice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const userData = await loginWithEmail(email, password, remember);

      // dùng role để redirect
      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "staff") {
        navigate("/staff");
      } else {
        navigate("/");
      }
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err.code));
      if (err.code === "auth/email-not-verified") {
        setPendingVerification(true);
      }
    }
  };

  const handleGoogle = async () => {
    setError("");
    setInfo("");
    setPendingVerification(false);
    setLoading(true);
    try {
      const userData = await loginWithGoogle();

      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "staff") {
        navigate("/staff");
      } else {
        navigate("/");
      }
      onSuccess();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(getErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setInfo("");
    setResendLoading(true);
    try {
      const result = await resendEmailVerification(email, password, remember);
      if (result?.alreadyVerified) {
        setPendingVerification(false);
        setInfo("Email này đã được xác minh. Bạn có thể đăng nhập ngay.");
        return;
      }
      setPendingVerification(true);
      setInfo(
        "Đã gửi lại email xác minh. Vui lòng kiểm tra hộp thư (và mục Spam).",
      );
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Email
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Mail className="h-4 w-4" />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:border-cinema-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Mật khẩu
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-cinema-primary"
          />
          Ghi nhớ đăng nhập
        </label>
        <button
          type="button"
          className="text-sm text-cinema-primary hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {info && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {info}
        </p>
      )}

      {pendingVerification && (
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={loading || resendLoading}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
        >
          {resendLoading ? "Đang gửi lại..." : "Gửi lại email xác minh"}
        </button>
      )}

      <button
        type="submit"
        disabled={loading}
        className="cinema-btn-primary w-full justify-center py-3 disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-700" />
        <span className="text-xs text-zinc-400">hoặc</span>
        <div className="h-px flex-1 bg-zinc-700" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
      >
        <GoogleIcon />
        Đăng nhập với Google
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const { registerWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length > 10) {
      setPhoneError("Số điện thoại không được vượt quá 10 số.");
      return;
    }
    setPhoneError("");
    setPhone(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone || !password || !confirm) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (phone.length > 10) {
      setPhoneError("Số điện thoại không được vượt quá 10 số.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!agreed) {
      setError("Vui lòng đồng ý với điều khoản sử dụng.");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, name, phone);
      onSuccess(email);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Họ và Tên
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <User className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:border-cinema-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Email
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Mail className="h-4 w-4" />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:border-cinema-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Số điện thoại
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Phone className="h-4 w-4" />
          </span>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            inputMode="numeric"
            maxLength={10}
            placeholder="0901234567"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:border-cinema-primary focus:outline-none"
          />
        </div>
        {phoneError && (
          <p className="mt-1.5 text-sm text-red-400">{phoneError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Mật khẩu
          </label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Xác nhận
          </label>
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-400">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-cinema-primary"
        />
        <span>
          Tôi đồng ý với{" "}
          <span className="cursor-pointer text-cinema-primary hover:underline">
            điều khoản sử dụng
          </span>{" "}
          và{" "}
          <span className="cursor-pointer text-cinema-primary hover:underline">
            chính sách bảo mật
          </span>
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="cinema-btn-primary w-full justify-center py-3 disabled:opacity-60"
      >
        {loading ? "Đang đăng ký..." : "Đăng ký"}
      </button>
    </form>
  );
}

function getErrorMessage(code) {
  console.log("getErrorMessage received code:", code);
  const map = {
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/user-not-found": "Tài khoản không tồn tại.",
    "auth/wrong-password": "Mật khẩu không đúng.",
    "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
    "auth/email-already-in-use": "Email này đã được sử dụng.",
    "auth/weak-password": "Mật khẩu quá yếu, cần ít nhất 6 ký tự.",
    "auth/email-not-verified":
      "Tài khoản chưa xác minh email. Vui lòng xác minh trước khi đăng nhập.",
    "auth/missing-email-for-verification":
      "Vui lòng nhập email và mật khẩu để gửi lại xác minh.",
    "auth/too-many-requests": "Quá nhiều lần thử. Vui lòng thử lại sau.",
    "auth/network-request-failed": "Lỗi kết nối mạng.",
  };
  return map[code] ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

function AuthPage() {
  const [tab, setTab] = useState("login");
  const [loginNotice, setLoginNotice] = useState("");

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-3 py-10 sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.12),transparent_45%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.05),transparent_35%)]" />
      <div className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-cinema-surface/90 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center gap-2 pt-2">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cinema-primary to-cinema-primary-dark shadow-lg">
            <Film className="h-6 w-6 text-white" />
          </span>
          <h1 className="text-2xl font-bold text-white">CinemaHub</h1>
          <p className="text-sm text-zinc-400">Đặt vé xem phim dễ dàng</p>
        </div>

        <div className="mb-6 flex rounded-xl border border-zinc-700 bg-zinc-800/50 p-1">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === "login"
                ? "bg-zinc-700 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === "register"
                ? "bg-zinc-700 text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {tab === "login" ? (
          <LoginForm
            notice={loginNotice}
            onSuccess={() => {
              setLoginNotice("");
              setTab("login");
            }}
          />
        ) : (
          <RegisterForm
            onSuccess={(registeredEmail) => {
              setLoginNotice(
                `Đăng ký thành công. Chúng tôi đã gửi email xác minh tới ${registeredEmail}.`,
              );
              setTab("login");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AuthPage;