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
      <button type="submit">Войти</button>
      <NavLink to={"/signup"}>Еще нет аккаунта?</NavLink>
    </form>
  );
}
