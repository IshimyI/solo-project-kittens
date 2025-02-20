import { NavLink } from "react-router";

export default function LoginPage({ handleLogin }) {
  return (
    <form onSubmit={handleLogin}>
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
        Войти
      </button>
      <NavLink
        className="m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        to={"/signup"}
      >
        Еще нет аккаунта?
      </NavLink>
    </form>
  );
}
