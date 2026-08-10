import { NavLink } from "react-router";
import React, { useState } from "react";

const linkClass =
  "m-1 text-white font-semibold text-base px-3 py-2 rounded-lg bg-kitt-primary hover:bg-kitt-secondary transition duration-300 transform hover:scale-105";

const mobileRowClass =
  "flex items-center gap-3 px-4 py-3 text-white font-semibold hover:bg-white/10 transition-colors duration-200";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "w-5 h-5 shrink-0",
};

const ProfileIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const CompassIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9l-2 6-6 2 2-6 6-2z" />
  </svg>
);
const BagIcon = () => (
  <svg {...iconProps}>
    <path d="M6 8h12l1 12H5L6 8z" />
    <path d="M9 8V6a3 3 0 016 0v2" />
  </svg>
);
const MusicIcon = ({ muted }) => (
  <svg {...iconProps}>
    <path d="M9 18V5l10-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="16" cy="16" r="3" />
    {muted && <path d="M3 3l18 18" />}
  </svg>
);
const LogoutIcon = () => (
  <svg {...iconProps}>
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </svg>
);

const Brand = () => (
  <NavLink to="/main" className="flex items-center gap-2 shrink-0 group">
    <img
      src="/favicon-cat-v2.png"
      alt=""
      className="w-9 h-9 drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
    />
    <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow-sm">
      Catventure
    </span>
  </NavLink>
);

export default function NavBar({ user, handleLogout, toggleMusic, isPlaying }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const desktopLinks = (
    <>
      {user && (
        <NavLink className={linkClass} to="/profile">
          {user.name}
        </NavLink>
      )}
      {user && (
        <NavLink className={linkClass} to="/main">
          Отправиться в путешествие
        </NavLink>
      )}
      {user && (
        <NavLink className={linkClass} to="/shop">
          Магазин
        </NavLink>
      )}
      <button
        className={`${linkClass} w-[180px] text-center whitespace-nowrap`}
        onClick={toggleMusic}
      >
        {isPlaying ? "Выключить музыку" : "Включить музыку"}
      </button>
      {user && (
        <button className={linkClass} onClick={handleLogout} type="button">
          Выйти
        </button>
      )}
    </>
  );

  return (
    <div className="bg-gradient-to-r from-kitt-background to-kitt-primary rounded-lg shadow-lg ring-1 ring-white/10">
      {/* Компактный хедер на маленьких экранах — бренд слева и
          анимированный бургер справа, вместо пяти растянутых кнопок. */}
      <div className="flex sm:hidden items-center justify-between p-4">
        <Brand />
        <button
          className="relative w-8 h-8 flex items-center justify-center shrink-0"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <span
            className={`absolute left-1/2 top-1/2 h-0.5 w-6 -ml-3 bg-white rounded transition-all duration-300 ease-in-out ${
              menuOpen ? "rotate-45" : "-translate-y-2"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 h-0.5 w-6 -ml-3 bg-white rounded transition-all duration-300 ease-in-out ${
              menuOpen ? "opacity-0 scale-x-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 h-0.5 w-6 -ml-3 bg-white rounded transition-all duration-300 ease-in-out ${
              menuOpen ? "-rotate-45" : "translate-y-2"
            }`}
          />
        </button>
      </div>

      {/* Единая выпадающая карточка-меню, плавно раскрывающаяся по высоте —
          строки в столбик с svg-иконками и тонкими разделителями. */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-3 mb-3 rounded-xl bg-kitt-primary/95 backdrop-blur-sm shadow-lg divide-y divide-white/15 overflow-hidden">
          {user && (
            <NavLink className={mobileRowClass} to="/profile" onClick={closeMenu}>
              <ProfileIcon />
              {user.name}
            </NavLink>
          )}
          {user && (
            <NavLink className={mobileRowClass} to="/main" onClick={closeMenu}>
              <CompassIcon />
              Отправиться в путешествие
            </NavLink>
          )}
          {user && (
            <NavLink className={mobileRowClass} to="/shop" onClick={closeMenu}>
              <BagIcon />
              Магазин
            </NavLink>
          )}
          <button className={`${mobileRowClass} w-full text-left`} onClick={toggleMusic}>
            <MusicIcon muted={!isPlaying} />
            {isPlaying ? "Выключить музыку" : "Включить музыку"}
          </button>
          {user && (
            <button
              className={`${mobileRowClass} w-full text-left`}
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              type="button"
            >
              <LogoutIcon />
              Выйти
            </button>
          )}
        </div>
      </div>

      {/* Обычная раскладка в ряд на широких экранах — бренд слева, ссылки
          справа. */}
      <div className="hidden sm:flex flex-row items-center justify-between p-4">
        <Brand />
        <div className="flex flex-row items-center flex-wrap justify-end">
          {desktopLinks}
        </div>
      </div>
    </div>
  );
}
