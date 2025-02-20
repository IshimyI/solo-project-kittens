import { NavLink } from "react-router";
import React from "react";

export default function NavBar({ user, handleLogout }) {
  return (
    <div>
      <NavLink
        className={
          "m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        }
        to="/profile"
      >
        {user ? user.name : "Guest"}
      </NavLink>
      <NavLink
        className={
          "m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        }
        to="/main"
      >
        Отправиться в путешествие
      </NavLink>
      <NavLink
        className={
          "m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        }
        to="/shop"
      >
        Магазин
      </NavLink>
      <NavLink
        className={
          "m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        }
        to="/signup"
      >
        Зарегистрироваться
      </NavLink>
      <NavLink
        className={
          "m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        }
        to="/login"
      >
        Войти
      </NavLink>
      <button
        className="m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        onClick={handleLogout}
        type="button"
      >
        Выйти
      </button>
    </div>
  );
}
