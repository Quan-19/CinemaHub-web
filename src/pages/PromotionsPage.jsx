import { Tag, Clock, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

export const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/promotions");

        const data = await res.json();

        setPromotions(data);
      } catch (err) {
        console.error("Error loading promotions:", err);
      }
    };

    fetchPromotions();
  }, []);

  const handleCopy = (code) => {

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }

    setCopied(code);

    setTimeout(() => setCopied(null), 2000);

  };

  return (

    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>

      <div
        className="py-10 border-b border-zinc-800"
        style={{ background: "linear-gradient(to bottom, #12121f, #0a0a0f)" }}
      >

        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <h1
            className="text-white mb-1"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Khuyến mãi
          </h1>

          <p className="text-zinc-400 text-sm">Ưu đãi hấp dẫn dành cho bạn</p>
        </div>

      </div>


      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {promotions.length === 0 && (
          <p className="text-zinc-400">Chưa có khuyến mãi</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.promotion_id}
              className="rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all"
              style={{ background: "#12121f" }}
            >

              <div className="relative h-44 overflow-hidden">

                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-white text-sm"
                  style={{ background: "#e50914", fontWeight: 700 }}
                >
                  -{promo.discount_percent}%
                </div>

              </div>

              <div className="p-5">

                <h3
                  className="text-white mb-2"
                  style={{ fontWeight: 700 }}
                >
                  {promo.title}
                </h3>

                <p className="text-zinc-400 text-sm mb-4">
                  {promo.description}
                </p>

                <div className="flex items-center gap-2 mb-3 text-zinc-500 text-xs">

                  <Clock className="w-3.5 h-3.5" />
                  Hạn sử dụng: {new Date(promo.end_date).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">

                  <div className="flex-1 bg-zinc-900 border border-dashed border-zinc-600 rounded-xl px-4 py-2.5 flex items-center gap-2">

                    <Tag className="w-4 h-4 text-red-500 shrink-0" />

                    <span
                      className="text-white text-sm tracking-wider"
                      style={{ fontWeight: 700 }}
                    >
                      {promo.code}
                    </span>

                  </div>

                  <button
                    onClick={() => handleCopy(promo.code)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      copied === promo.code
                        ? "bg-green-600"
                        : "bg-zinc-700 hover:bg-zinc-600"
                    }`}
                  >

                    {copied === promo.code ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );
};

export default PromotionsPage;