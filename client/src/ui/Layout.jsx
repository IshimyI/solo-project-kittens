import { Outlet } from "react-router";
import NavBar from "./NavBar";

export default function Layout({ user, handleLogout, toggleMusic, isPlaying }) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar
        user={user}
        handleLogout={handleLogout}
        toggleMusic={toggleMusic}
        isPlaying={isPlaying}
      />
      {/* Страницы (MainPage/ProfilePage) высчитывали свою высоту через
          фиксированный vh, что не совпадало с реальной (переменной)
          высотой навбара и оставляло щель снизу. Теперь страница просто
          занимает ровно оставшееся место. */}
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
