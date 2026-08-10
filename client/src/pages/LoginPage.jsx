import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router";

export default function LoginPage({ handleLogin, user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/main");
    }
  }, [user, navigate]);

  // overflow-hidden на самой странице не блокирует прокрутку — реально
  // скроллится body. Жёстко фиксируем его, пока страница показана.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden bg-gradient-to-br from-kitt-background via-kitt-foreground/40 to-kitt-background text-kitt-txt px-4">
      <form
        onSubmit={handleLogin}
        className="relative bg-kitt-foreground p-8 pt-20 rounded-2xl shadow-2xl border border-white/20 max-w-sm w-full"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 select-none pointer-events-none">
          {/* Оба изображения нарисованы на одном холсте 1533x1482 — как
              шляпа/тело/пальто в самой игре, поэтому просто накладываем их
              друг на друга в одинаковом размере и позиции. */}
          <img src="/imgs/coat1.png" alt="" aria-hidden="true" className="w-full drop-shadow-xl" />
          <img
            src="/imgs/hat6.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full drop-shadow-xl"
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-6 text-kitt-txt">
          С возвращением!
        </h2>

        <div className="mb-4">
          <label htmlFor="em1" className="block text-sm font-medium mb-1.5 text-kitt-txt">
            Почта
          </label>
          <input
            name="email"
            type="email"
            className="w-full p-3 bg-white border border-transparent rounded-xl text-kitt-txt shadow-inner focus:outline-none focus:ring-2 focus:ring-kitt-secondary transition-shadow"
            id="em1"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="pass1"
            className="block text-sm font-medium mb-1.5 text-kitt-txt"
          >
            Пароль
          </label>
          <input
            name="password"
            type="password"
            className="w-full p-3 bg-white border border-transparent rounded-xl text-kitt-txt shadow-inner focus:outline-none focus:ring-2 focus:ring-kitt-secondary transition-shadow"
            id="pass1"
          />
        </div>

        <button
          className="w-full py-3 bg-kitt-primary text-white font-semibold rounded-xl shadow hover:bg-kitt-secondary hover:scale-[1.02] active:scale-95 transition-all duration-200"
          type="submit"
        >
          Войти
        </button>

        <NavLink
          className="block text-center mt-4 text-kitt-txt/70 font-medium hover:text-kitt-txt transition-colors"
          to={"/signup"}
        >
          Ещё нет аккаунта? Зарегистрироваться →
        </NavLink>
      </form>
    </div>
  );
}
