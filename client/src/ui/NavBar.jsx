import { NavLink } from "react-router";
import React from "react";

export default function NavBar({ user, handleLogout, toggleMusic, isPlaying }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gradient-to-r from-kitt-background to-kitt-primary rounded-lg shadow-lg">
      {user && (
        <NavLink
          className="m-2 text-white font-semibold text-lg px-6 py-2 rounded-lg bg-kitt-primary hover:bg-kitt-secondary transition duration-300 transform hover:scale-105"
          to="/profile"
        >
          {user ? user.name : "Guest"}
        </NavLink>
      )}
      {user && (
        <NavLink
          className="m-2 text-white font-semibold text-lg px-6 py-2 rounded-lg bg-kitt-primary hover:bg-kitt-secondary transition duration-300 transform hover:scale-105"
          to="/main"
        >
          Отправиться в путешествие
        </NavLink>
      )}
      {user && (
        <NavLink
          className="m-2 text-white font-semibold text-lg px-6 py-2 rounded-lg bg-kitt-primary hover:bg-kitt-secondary transition duration-300 transform hover:scale-105"
          to="/shop"
        >
          Магазин
        </NavLink>
      )}
      <div>
        <button
          className="m-2 text-white font-semibold text-lg px-6 py-2 rounded-lg bg-kitt-primary hover:bg-kitt-secondary transition duration-300 transform hover:scale-105"
          onClick={toggleMusic}
        >
          {isPlaying ? "Выключить музыку" : "Включить музыку"}
        </button>
      </div>
      {user && (
        <button
          className="m-2 text-white font-semibold text-lg px-6 py-2 rounded-lg bg-kitt-primary hover:bg-kitt-secondary transition duration-300 transform hover:scale-105"
          onClick={handleLogout}
          type="button"
        >
          Выйти
        </button>
      )}
    </div>
  );
}
