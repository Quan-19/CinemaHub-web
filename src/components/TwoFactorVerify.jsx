// components/TwoFactorVerify.jsx
import { useState } from "react";
import { Lock, Shield } from "lucide-react";

function TwoFactorVerify({ email, onVerify, onBack }) {
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!useBackup && code.length !== 6) {
      setError("Vui lòng nhập mã 6 số");
      return;
    }
    
    if (useBackup && !backupCode) {
      setError("Vui lòng nhập mã dự phòng");
      return;
    }

    setLoading(true);
    try {
      await onVerify(useBackup ? null : code, useBackup ? backupCode : null);
    } catch (err) {
      setError(err.message || "Mã xác thực không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cinema-primary/10">
          <Shield className="h-8 w-8 text-cinema-primary" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          Xác thực 2 yếu tố
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Vui lòng nhập mã xác thực từ ứng dụng Google Authenticator
        </p>
        {email && (
          <p className="mt-1 text-xs text-zinc-500">
            Tài khoản: {email}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!useBackup ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Mã xác thực (6 số)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 text-center text-2xl font-mono text-white placeholder:text-zinc-500 focus:border-cinema-primary focus:outline-none"
              maxLength={6}
              autoFocus
              disabled={loading}
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Mã dự phòng
            </label>
            <input
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 py-3 px-4 text-center font-mono text-white placeholder:text-zinc-500 focus:border-cinema-primary focus:outline-none"
              autoFocus
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || (!useBackup && code.length !== 6)}
          className="cinema-btn-primary w-full justify-center py-3 disabled:opacity-60"
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>

        <button
          type="button"
          onClick={() => {
            setUseBackup(!useBackup);
            setCode("");
            setBackupCode("");
            setError("");
          }}
          className="w-full text-center text-sm text-cinema-primary hover:underline"
        >
          {useBackup ? "← Quay lại nhập mã OTP" : "Sử dụng mã dự phòng"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm text-zinc-500 hover:text-zinc-400"
        >
          ← Quay lại đăng nhập
        </button>
      </form>
    </div>
  );
}

export default TwoFactorVerify;