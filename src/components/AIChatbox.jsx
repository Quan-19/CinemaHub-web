// components/AIChatbox.jsx - Phiên bản cập nhật
import { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  MessageCircle,
  X,
  Send,
  Loader,
  Sparkles,
  Minimize2,
} from "lucide-react";

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: "assistant",
          content:
            "🎬 Chào mừng bạn đến với EbizCinema!\n\nTôi là trợ lý AI, sẵn sàng tư vấn phim 24/7. Hãy cho tôi biết sở thích của bạn nhé! 🍿",
        },
      ]);
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input
    setIsLoading(true);

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          data.message ||
          "Xin lỗi, tôi chưa hiểu rõ. Bạn có thể nói rõ hơn về thể loại phim bạn thích không?",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "❌ Có lỗi xảy ra. Vui lòng thử lại sau!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Xử lý click suggestion - TỰ ĐỘNG GỬI
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  // Minimize = đóng hẳn về nút tròn
  const handleMinimize = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat button - Đỏ đen (chỉ hiện khi chat đóng) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 group z-50"
        >
          <div className="relative">
            {/* Pulse animation */}
            <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-110">
              <MessageCircle size={24} className="fill-current" />
            </div>
          </div>
        </button>
      )}

      {/* Chat window - Đỏ đen chuyên nghiệp */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-2xl border-2 border-red-600/30 shadow-2xl shadow-red-600/20 flex flex-col overflow-hidden z-50 animate-slideUp">
          {/* Header - Gradient đỏ */}
          <div className="relative px-5 py-4 bg-gradient-to-r from-red-700 via-red-600 to-red-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <div>
                  <span className="text-white font-bold text-base tracking-wide">
                    AI EbizCinema
                  </span>
                  <p className="text-red-200 text-xs">Online 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Nút thu gọn - đóng về nút tròn */}
                <button
                  onClick={handleMinimize}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Thu gọn"
                >
                  <Minimize2 size={16} />
                </button>
                {/* Nút đóng - tắt hẳn */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                      : "bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-red-600/20"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-2xl border border-red-600/20">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions - ĐÃ BỎ "Top 5 phim hay nhất" */}
          <div className="px-4 py-2 bg-gray-900/50 border-t border-red-600/20">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {[
                "Phim hành động",
                "Phim hài hước",
                "Phim kinh dị",
                "Phim tình cảm",
                "Gợi ý phim ngẫu nhiên",
                "Còn phim khác không?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-red-600/20 text-gray-300 hover:text-red-400 rounded-full transition-all whitespace-nowrap border border-red-600/20 cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-gray-900/50 border-t border-red-600/20">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all border border-red-600/20"
                  rows="1"
                  style={{ minHeight: "40px", maxHeight: "100px" }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30"
              >
                {isLoading ? (
                  <Loader size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles size={12} className="text-red-500" />
              AI tư vấn phim
              <Sparkles size={12} className="text-red-500" />
            </p>
          </div>
        </div>
      )}
    </>
  );
}
