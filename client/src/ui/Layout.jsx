import { Outlet } from "react-router";
import NavBar from "./NavBar";

export default function Layout({ user, handleLogout, toggleMusic, isPlaying }) {
  return (
    <>
      <NavBar
        user={user}
        handleLogout={handleLogout}
        toggleMusic={toggleMusic}
        isPlaying={isPlaying}
      />
      <Outlet />
    </>
  );
}
