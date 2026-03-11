import { MapPin, Phone, Clock } from "lucide-react";
import { CINEMAS } from "../data/mockData";

const BRAND_COLORS = {
  CGV: "#e50914",
  Lotte: "#c41230",
  BHD: "#1e40af",
  Galaxy: "#7c3aed",
};

function CinemaPage() {
  return (
    <div className="min-h-screen pt-16" style={{ background: "#0a0a0f" }}>
      <div
        className="py-10 border-b border-zinc-800"
        style={{ background: "linear-gradient(to bottom, #12121f, #0a0a0f)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-white mb-1" style={{ fontSize: "2rem", fontWeight: 800 }}>
            Hệ thống rạp chiếu
          </h1>
          <p className="text-zinc-400 text-sm">{CINEMAS.length} rạp chiếu phim toàn quốc</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CINEMAS.map((cinema) => (
            <div
              key={cinema.id}
              className="rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all p-5"
              style={{ background: "#12121f" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm shrink-0"
                  style={{ background: BRAND_COLORS[cinema.brand] || "#e50914", fontWeight: 700 }}
                >
                  {cinema.brand}
                </div>
                <div className="flex-1">
                  <h3 className="text-white mb-1" style={{ fontWeight: 700 }}>{cinema.name}</h3>
                  <p className="text-zinc-400 text-sm flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {cinema.address}
                  </p>
                  <div className="flex items-center gap-4 text-zinc-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cinema.showtimes.length} suất/ngày
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      1900 6017
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CinemaPage;
