import {
  Facebook,
  Film,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";

const aboutLinks = [
  { label: "Giới thiệu", path: "/policies#about" },
  { label: "Tuyển dụng", path: "/policies#careers" },
  { label: "Điều khoản sử dụng", path: "/policies#terms" },
  { label: "Chính sách bảo mật", path: "/policies#privacy" },
];

const supportLinks = [
  { label: "Hỗ trợ khách hàng", path: "/policies#contact" },
  { label: "Chính sách hoàn vé", path: "/policies#refund" },
  { label: "Câu hỏi thường gặp", path: "/policies#faq" },
  { label: "Liên hệ quảng cáo", path: "/policies#contact" },
];

const paymentMethods = ["VISA", "ZALO Pay", "MOMO", "VNPAY"];

function Footer() {
  return (
    <footer className="mt-16 rounded-t-3xl border-t border-zinc-700 bg-zinc-950/80">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cinema-primary to-cinema-primary-dark">
                <Film className="h-4 w-4 text-white" />
              </span>
              <span className="text-2xl font-bold text-white">
                Ebiz<span className="text-cinema-primary">Cinema</span>
              </span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-zinc-400 max-w-sm">
              Hệ thống rạp chiếu phim hiện đại với trải nghiệm điện ảnh đỉnh
              cao. Đặt vé dễ dàng, nhanh chóng trong vài giây. Hơn 50 rạp trên
              toàn quốc.
            </p>
            <div className="flex items-center gap-2.5">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Về EbizCinema
            </h4>
            <ul className="space-y-2">
              {aboutLinks.map((item) => (
                <li key={item.label}>
                  {item.path.startsWith("/") ? (
                    <Link
                      to={item.path}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.path}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Hỗ trợ
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  {item.path.startsWith("/") ? (
                    <Link
                      to={item.path}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.path}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Liên hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cinema-primary" />
                191 Bà Triệu, Hai Bà Trưng, Hà Nội
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Phone className="h-4 w-4 shrink-0 text-cinema-primary" />
                1900 6017
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="h-4 w-4 shrink-0 text-cinema-primary" />
                support@ebizcinema.vn
              </li>
            </ul>
            <div className="mt-4">
              <p className="mb-2 text-xs text-zinc-400">
                Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày bao gồm cả Lễ Tết)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-700 pt-6 sm:flex-row">
          <p className="text-sm text-zinc-400">
            © 2026 EbizCinema. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <span className="mr-1 text-xs text-zinc-400">
              Phương thức thanh toán
            </span>
            {paymentMethods.map((pay) => (
              <span
                key={pay}
                className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
              >
                {pay}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
