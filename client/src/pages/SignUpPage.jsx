import React from "react";
import { NavLink } from "react-router";

export default function SignUpPage({ handleSignUp }) {
  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label htmlFor="name1" className="form-label">
          Логин
        </label>
        <input name="name" type="text" className="form-control" id="name1" />
      </div>
      <div>
        <label htmlFor="em1" className="form-label">
          Почта
        </label>
        <input name="email" type="email" className="form-control" id="em1" />
      </div>
      <div>
        <label htmlFor="pass1" className="form-label">
          Пароль
        </label>
        <input
          name="password"
          type="password"
          className="form-control"
          id="pass1"
        />
      </div>
      <button
        className="m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        type="submit"
      >
        Зарегистрироваться
      </button>
      <NavLink
        className="m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        to={"/login"}
      >
        Уже есть аккаунт?
      </NavLink>
    </form>
  );
}
