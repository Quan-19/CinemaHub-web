import {
  Facebook,
  Film,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const aboutLinks = [
  'Giới thiệu',
  'Tuyển dụng',
  'Điều khoản sử dụng',
  'Chính sách bảo mật',
  'FAQ',
]

const genres = [
  'Hành động',
  'Kinh dị',
  'Tình cảm',
  'Hoạt hình',
  'Khoa học viễn tưởng',
  'Chính kịch',
]

const paymentMethods = ['VISA', 'ZALO Pay', 'MOMO', 'VNPAY']

function Footer() {
  return (
    <footer className="mt-16 rounded-t-3xl border-t border-zinc-800 bg-zinc-950/80">
      <div className="px-4 py-12 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cinema-primary to-cinema-primary-dark">
                <Film className="h-4 w-4 text-white" />
              </span>
              <span className="text-2xl font-bold text-white">
                Cinema<span className="text-cinema-primary">Hub</span>
              </span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-zinc-400">
              Hệ thống rạp chiếu phim hiện đại với trải nghiệm điện ảnh đỉnh cao.
              Đặt vé dễ dàng, nhanh chóng trong vài giây.
            </p>
            <div className="flex items-center gap-2.5">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Về chúng tôi
            </h4>
            <ul className="space-y-2">
              {aboutLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-zinc-400 transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Thể loại phim
            </h4>
            <ul className="space-y-2">
              {genres.map((item) => (
                <li key={item}>
                  <Link
                    to={`/movies?genre=${encodeURIComponent(item)}`}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
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
                support@cinemahub.vn
              </li>
            </ul>
            <div className="mt-4">
              <p className="mb-2 text-xs text-zinc-500">Tải ứng dụng</p>
              <div className="flex gap-2">
                <div className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600">
                  App Store
                </div>
                <div className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600">
                  Google Play
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-6 sm:flex-row">
          <p className="text-sm text-zinc-500">© 2026 CinemaHub. Tất cả quyền được bảo lưu.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <span className="mr-1 text-xs text-zinc-500">Phương thức thanh toán</span>
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
  )
}

export default Footer
