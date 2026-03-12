import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, MapPin, Calendar, Clock, Star, Film, Armchair, User, Hash, ChevronLeft } from "lucide-react";

const SEAT_TYPE_LABEL = {
  standard: "Thường",
  vip: "VIP",
  couple: "Couple",
};

const SEAT_TYPE_COLOR = {
  standard: "rgba(255,255,255,0.55)",
  vip: "#f59e0b",
  couple: "#e50914",
};

const RATING_COLOR = {
  P: "#22c55e", T13: "#3b82f6", T16: "#f59e0b", T18: "#ef4444",
};

// Fake barcode made of CSS bars
const Barcode = ({ value }) => {
  const bars = value.split("").map((c, i) => {
    const w = (c.charCodeAt(0) % 3) + 1;
    const h = 20 + (c.charCodeAt(0) % 20);
    return { w, h, key: i };
  });
  // pad to get nice count
  const padded = [...bars];
  while (padded.length < 60) padded.push({ w: 1, h: 28 + (padded.length % 10), key: padded.length + 1000 });

  return (
    <div className="flex items-end justify-center gap-px" style={{ height: 52 }}>
      {padded.slice(0, 60).map(b => (
        <div
          key={b.key}
          style={{
            width: b.w,
            height: b.h,
            background: "#fff",
            borderRadius: 1,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
};

export const TicketPage = () => {
  const { bookingCode: code } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showScanAnim, setShowScanAnim] = useState(true);

  useEffect(() => {
    if (!code) { setNotFound(true); return; }
    const raw = localStorage.getItem(`ticket_${code}`);
    if (!raw) { setNotFound(true); return; }
    try {
      setTicket(JSON.parse(raw));
    } catch {
      setNotFound(true);
    }
    const t = setTimeout(() => setShowScanAnim(false), 1200);
    return () => clearTimeout(t);
  }, [code]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#07070f" }}>
        <div className="text-6xl mb-4">🎟️</div>
        <h2 className="text-white mb-2" style={{ fontSize: 22, fontWeight: 700 }}>Không tìm thấy vé</h2>
        <p className="text-zinc-400 text-sm mb-6 text-center">Mã vé không hợp lệ hoặc đã hết hạn</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 rounded-xl text-white text-sm"
          style={{ background: "#e50914" }}>
          Về trang chủ
        </button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070f" }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Đang tải vé...</p>
        </div>
      </div>
    );
  }

  const ticketUrl = `${window.location.origin}/ticket/${ticket.bookingCode}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4"
      style={{ background: "linear-gradient(180deg, #0a0010 0%, #07070f 40%)" }}>

      {/* Back button */}
      <div className="w-full max-w-sm mb-4">
        <button
          onClick={() => navigate("/booking/confirm", {
            state: {
              fromTicket: true,
              ticketData: ticket,
            },
          })}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} /> Quay lại
        </button>
      </div>

      {/* Scan animation overlay */}
      {showScanAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}>
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-red-500/60 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle size={40} style={{ color: "#22c55e" }} />
              </div>
            </div>
            <p className="text-white text-lg" style={{ fontWeight: 700 }}>Xác thực vé thành công</p>
            <p className="text-zinc-400 text-sm mt-1">Chào mừng đến CineStar!</p>
          </div>
        </div>
      )}

      {/* Valid badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full mb-5"
        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)" }}>
        <CheckCircle size={15} style={{ color: "#22c55e" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>Vé hợp lệ · Sẵn sàng check-in</span>
      </div>

      {/* ─── TICKET CARD ─── */}
      <div className="w-full max-w-sm" style={{ filter: "drop-shadow(0 20px 60px rgba(229,9,20,0.25))" }}>

        {/* Top section */}
        <div className="rounded-t-3xl overflow-hidden" style={{ background: "#111122" }}>

          {/* Cinema header bar */}
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ background: "linear-gradient(90deg, #e50914 0%, #b20710 100%)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <Star size={14} fill="white" color="white" />
              </div>
              <div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>CINE</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>STAR</span>
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>VÉ ĐIỆN TỬ</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>E-TICKET</div>
            </div>
          </div>

          {/* Movie info */}
          <div className="px-5 pt-4 pb-3 flex gap-3">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={ticket.moviePoster}
                alt={ticket.movieTitle}
                className="rounded-xl object-cover"
                style={{ width: 72, height: 100, border: "2px solid rgba(255,255,255,0.08)" }}
                onError={e => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='100'%3E%3Crect fill='%23222230' width='72' height='100' rx='8'/%3E%3Ctext x='36' y='55' text-anchor='middle' fill='%23555' font-size='28'%3E%F0%9F%8E%AC%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}
                className="leading-tight mb-0.5">
                {ticket.movieTitle}
              </div>
              {ticket.movieOriginalTitle && (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }} className="mb-2">
                  {ticket.movieOriginalTitle}
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: `${RATING_COLOR[ticket.movieRating] || "#e50914"}20`, color: RATING_COLOR[ticket.movieRating] || "#e50914" }}>
                  {ticket.movieRating}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                  {ticket.showtimeType}
                </span>
                <span className="px-2 py-0.5 rounded text-xs"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                  {ticket.movieDuration} phút
                </span>
              </div>

              {/* Genre tags */}
              <div className="flex flex-wrap gap-1">
                {ticket.movieGenre.slice(0, 2).map(g => (
                  <span key={g} style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>• {g}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              {
                icon: <MapPin size={13} />,
                label: "Rạp chiếu",
                value: ticket.cinemaName,
                sub: ticket.cinemaAddress,
                color: "#e50914",
              },
              {
                icon: <Calendar size={13} />,
                label: "Ngày chiếu",
                value: ticket.date,
                sub: null,
                color: "#06b6d4",
              },
              {
                icon: <Clock size={13} />,
                label: "Giờ chiếu",
                value: ticket.time,
                sub: null,
                color: "#22c55e",
              },
              {
                icon: <Film size={13} />,
                label: "Phòng chiếu",
                value: ticket.roomId,
                sub: null,
                color: "#8b5cf6",
              },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5"
                style={{ borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${row.color}18` }}>
                  <span style={{ color: row.color }}>{row.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 1 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{row.value}</div>
                  {row.sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{row.sub}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Seats */}
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Armchair size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>GHẾ ĐÃ ĐẶT</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ticket.seats.map(seat => (
                <div key={seat.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: seat.type === "vip" ? "rgba(245,158,11,0.12)" : seat.type === "couple" ? "rgba(229,9,20,0.12)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${seat.type === "vip" ? "rgba(245,158,11,0.3)" : seat.type === "couple" ? "rgba(229,9,20,0.3)" : "rgba(255,255,255,0.1)"}`,
                  }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: SEAT_TYPE_COLOR[seat.type] }}>{seat.id}</span>
                  <span className="px-1 py-0.5 rounded text-xs" style={{ fontSize: 9, background: "rgba(0,0,0,0.3)", color: SEAT_TYPE_COLOR[seat.type] }}>
                    {SEAT_TYPE_LABEL[seat.type]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Total */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.25)" }}>
                <User size={14} style={{ color: "#e50914" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Khách hàng</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{ticket.customerName}</div>
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Tổng thanh toán</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>{ticket.grandTotal.toLocaleString()}₫</div>
            </div>
          </div>
        </div>

        {/* ─── Perforation ─── */}
        <div className="relative flex items-center" style={{ background: "transparent", height: 24 }}>
          {/* Left notch */}
          <div className="absolute -left-4 w-8 h-8 rounded-full" style={{ background: "#07070f" }} />
          {/* Dashed line */}
          <div className="flex-1 mx-4 border-dashed" style={{ borderTop: "2px dashed rgba(255,255,255,0.12)" }} />
          {/* Right notch */}
          <div className="absolute -right-4 w-8 h-8 rounded-full" style={{ background: "#07070f" }} />
        </div>

        {/* Bottom section */}
        <div className="rounded-b-3xl px-5 pt-4 pb-5" style={{ background: "#111122" }}>

          {/* Booking code + barcode */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Hash size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>MÃ ĐẶT VÉ</span>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 900, letterSpacing: 6, color: "#fff" }}>
              {ticket.bookingCode}
            </div>

            {/* Barcode */}
            <div className="mt-3">
              <Barcode value={ticket.bookingCode} />
            </div>
          </div>

          {/* Divider */}
          <div className="my-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full" style={{ background: "#e50914" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
                QUÉT MÃ QR ĐỂ XÁC THỰC VÉ
              </span>
              <div className="w-1 h-4 rounded-full" style={{ background: "#e50914" }} />
            </div>

            <div className="p-3 rounded-2xl" style={{ background: "#fff" }}>
              <QRCodeSVG
                value={ticketUrl}
                size={150}
                bgColor="#ffffff"
                fgColor="#07070f"
                level="H"
                imageSettings={{
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e50914'%3E%3Cpath d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z'/%3E%3C/svg%3E",
                  x: undefined, y: undefined,
                  height: 28, width: 28,
                  excavate: true,
                }}
              />
            </div>

            <p className="text-center mt-3" style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
              Vui lòng xuất trình vé tại cổng soát vé<br />
              Please present this ticket at the entrance
            </p>
          </div>

          {/* Issue info */}
          <div className="mt-4 pt-3 flex justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            <span>Cấp: {ticket.issuedAt}</span>
            <span>CineStar © 2026</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center mt-6" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", maxWidth: 300 }}>
        Vé chỉ sử dụng một lần. Không được chuyển nhượng hoặc hoàn trả sau khi đã thanh toán.
      </p>
    </div>
  );
};

export default TicketPage;
