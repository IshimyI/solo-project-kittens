import React, { useEffect } from "react";
import ProductCard from "../ui/ProductCard";
import { NavLink, useNavigate } from "react-router-dom";

export default function ShopPage({ user, buyItem, products, loading }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(230,92,71,0.18), transparent 55%), linear-gradient(180deg, var(--color-kitt-background) 0%, var(--color-kitt-foreground) 60%, rgba(32,145,135,0.28) 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-2 pt-3 pb-2">
        <h1 className="text-center text-lg sm:text-3xl font-bold bg-kitt-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg w-[92%] max-w-[560px]">
          Магазин путешественника
        </h1>
        {user?.coins != null && (
          <div className="flex items-center gap-2 bg-kitt-background/85 backdrop-blur-sm text-kitt-txt px-4 py-1.5 rounded-full shadow-lg">
            <img src="/coin-icon.png" alt="" className="w-5 h-5" />
            <span className="font-semibold">{user.coins} монет</span>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-center text-xl mt-10 text-kitt-txt">Загрузка магазина...</p>
      ) : products.length === 0 ? (
        <div className="relative flex items-center justify-center px-4 mt-2">
          <span
            className="absolute text-3xl select-none animate-bounce"
            style={{ top: "8%", left: "14%", animationDelay: "0s" }}
          >
            ✨
          </span>
          <span
            className="absolute text-2xl select-none animate-bounce"
            style={{ top: "18%", right: "16%", animationDelay: "0.3s" }}
          >
            🎉
          </span>
          <span
            className="absolute text-2xl select-none animate-bounce"
            style={{ bottom: "14%", left: "18%", animationDelay: "0.6s" }}
          >
            ⭐
          </span>
          <span
            className="absolute text-3xl select-none animate-bounce"
            style={{ bottom: "10%", right: "14%", animationDelay: "0.9s" }}
          >
            🎊
          </span>

          <div
            className="relative text-center p-6 rounded-3xl shadow-2xl max-w-sm mx-auto border border-white/20 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(230,92,71,0.75) 0%, rgba(74,52,46,0.75) 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 30% 15%, white, transparent 45%)",
              }}
            />
            <div className="relative">
              <div className="relative inline-block mb-3">
                <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
                <span className="relative block text-5xl drop-shadow-lg">
                  🏆
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold mb-2 text-white drop-shadow">
                Гардероб собран полностью!
              </h2>
              <p className="text-base text-white/90 mb-1">
                Ты обчистил лавку до последней нитки.
              </p>
              <p className="text-sm text-white/80 mb-4 italic">
                Теперь ты — самый стильный путешественник во всех странах
                разом 🐾👑
              </p>
              <NavLink
                className="inline-flex items-center gap-2 px-5 py-2 text-kitt-primary bg-white rounded-full shadow-lg font-semibold hover:scale-110 hover:shadow-2xl transition-all duration-300"
                to="/profile"
              >
                Вернуться в гардероб
              </NavLink>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 md:px-12 max-w-7xl mx-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} buyItem={buyItem} />
          ))}
        </div>
      )}
    </div>
  );
}
