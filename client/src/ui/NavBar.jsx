import { NavLink } from "react-router";
import React from "react";

export default function NavBar({ user, handleLogout }) {
  return (
    <div>
      <NavLink to="/profile">{user ? user.name : "Guest"}</NavLink>
      <NavLink to="/">Отправиться в путешествие</NavLink>
      <NavLink to="/shop">Магазин</NavLink>
      <NavLink to="/signup">Зарегистрироваться</NavLink>
      <NavLink to="/login">Войти</NavLink>
      <button onClick={handleLogout} type="button">
        Выйти
      </button>
    </div>
  );
}
