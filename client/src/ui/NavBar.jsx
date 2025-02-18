import { NavLink } from "react-router";
import React from "react";

export default function NavBar() {
  return (
    <div>
      <NavLink to="/profile">Профиль</NavLink>
      <NavLink to="/">Отправиться в путешествие</NavLink>
      <NavLink to="/shop">Магазин</NavLink>
    </div>
  );
}
