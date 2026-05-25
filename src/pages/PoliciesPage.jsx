import { ShieldCheck, FileText, Mail, MapPin, Phone } from "lucide-react";

function PoliciesPage() {
  return (
    <main className="min-h-screen bg-cinema-bg">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.12),transparent_45%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.05),transparent_35%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-cinema-primary" />
              Chính sách và điều khoản
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Điều khoản sử dụng và Chính sách bảo mật
            </h1>
            <p className="max-w-3xl text-sm text-zinc-400 sm:text-base">
              Tài liệu này mô tả cách EbizCinema thu thập, sử dụng, bảo vệ thông
              tin cá nhân và các điều kiện khi khách hàng sử dụng dịch vụ đặt vé
              trực tuyến.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="rounded-2xl border border-white/5 bg-cinema-surface/80 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-cinema-primary" />
              <h2 id="terms" className="text-xl font-semibold text-white">
                Điều khoản sử dụng
              </h2>
            </div>
            <div className="mt-4 space-y-4 text-sm text-zinc-300">
              <p>
                Khi truy cập và sử dụng website/ứng dụng EbizCinema, bạn xác
                nhận đã đọc, hiểu và đồng ý với các điều khoản dưới đây. Điều
                khoản có thể được cập nhật theo từng thời điểm và có hiệu lực
                ngay khi đăng tải.
              </p>
              <div>
                <h3 className="text-base font-semibold text-white">
                  1. Đối tượng áp dụng
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Khách hàng từ 13 tuổi trở lên hoặc có sự đồng ý của người
                    giám hộ.
                  </li>
                  <li>
                    Thông tin đăng ký cần chính xác và được cập nhật khi thay
                    đổi.
                  </li>
                  <li>
                    Khách hàng tự chịu trách nhiệm về tài khoản, mật khẩu và
                    giao dịch.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  2. Quy trình đặt vé
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Chọn phim, rạp, suất chiếu và ghế ngồi.</li>
                  <li>
                    Kiểm tra tổng tiền và thông tin giao dịch trước khi thanh
                    toán.
                  </li>
                  <li>
                    Thanh toán thành công sẽ nhận mã vé qua email/ứng dụng.
                  </li>
                  <li>
                    Thời gian đóng đặt vé online: 30 phút trước giờ chiếu hoặc
                    khi hết vé.
                  </li>
                  <li>Mỗi giao dịch tối đa 8 vé.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  3. Thanh toán
                </h3>
                <p className="mt-2">
                  EbizCinema hỗ trợ các hình thức thanh toán: thẻ tín dụng/ghi
                  nợ, thẻ ATM nội địa, ví điện tử (VNPAY, MoMo, ZaloPay), điểm
                  tích lũy và mã giảm giá/quà tặng (nếu có).
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  4. Hủy/đổi vé và hoàn tiền
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Hoàn/hủy vé chỉ áp dụng cho giao dịch thành công tại Rạp
                    trước giờ chiếu ít nhất 30 phút.
                  </li>
                  <li>
                    Không áp dụng hoàn/hủy vé cho các suất chiếu đặt vé qua
                    Website
                  </li>
                  <li>
                    Thời gian hoàn tiền phụ thuộc vào phương thức thanh toán và
                    ngân hàng.
                  </li>
                  <li>
                    Một số suất chiếu/chương trình đặc biệt có thể không áp dụng
                    hoàn vé.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  5. Xác minh độ tuổi
                </h3>
                <p className="mt-2">
                  Khách hàng cần xuất trình giấy tờ tùy thân hợp lệ khi nhận
                  vé/vào rạp để đối chiếu độ tuổi theo quy định phân loại phim
                  trước khi vào rạp.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-cinema-surface/80 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-cinema-primary" />
              <h2 id="privacy" className="text-xl font-semibold text-white">
                Chính sách bảo mật
              </h2>
            </div>
            <div className="mt-4 space-y-4 text-sm text-zinc-300">
              <div>
                <h3 className="text-base font-semibold text-white">
                  1. Thông tin thu thập
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Thông tin tài khoản: họ tên, email, số điện thoại.</li>
                  <li>
                    Thông tin giao dịch: vé đã mua, lịch sử thanh toán, ưu đãi
                    đã dùng.
                  </li>
                  <li>
                    Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt (nếu cần).
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  2. Mục đích sử dụng
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Xử lý đặt vé, thanh toán, xác nhận giao dịch.</li>
                  <li>Hỗ trợ khách hàng, thông báo về suất chiếu, ưu đãi.</li>
                  <li>
                    Cá nhân hóa trải nghiệm và cải thiện chất lượng dịch vụ.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  3. Chia sẻ thông tin
                </h3>
                <p className="mt-2">
                  EbizCinema chỉ chia sẻ thông tin với đối tác thanh toán hoặc
                  nhà cung cấp dịch vụ khi cần thiết để thực hiện giao dịch, và
                  tuân thủ quy định pháp luật.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  4. Lưu trữ và bảo mật
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Thông tin được lưu trữ an toàn và chỉ sử dụng trong phạm vi
                    cần thiết.
                  </li>
                  <li>
                    Áp dụng biện pháp kỹ thuật và quy trình bảo mật để giảm rủi
                    ro.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  5. Quyền của khách hàng
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Yêu cầu xem, cập nhật, chỉnh sửa hoặc xóa thông tin cá nhân.
                  </li>
                  <li>Từ chối nhận thông báo tiếp thị (nếu có).</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-cinema-surface/80 p-6 sm:p-8">
            <h2 id="contact" className="text-xl font-semibold text-white">
              Liên hệ
            </h2>
            <p className="mt-3 text-sm text-zinc-300">
              Nếu cần hỗ trợ, vui lòng liên hệ EbizCinema theo thông tin sau:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cinema-primary" />
                191 Bà Triệu, Hai Bà Trưng, Hà Nội
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cinema-primary" />
                1900 6017
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cinema-primary" />
                support@ebizcinema.vn
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PoliciesPage;
