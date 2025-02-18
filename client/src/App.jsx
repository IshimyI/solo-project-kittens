import { Routes, Route } from "react-router";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import SignUpPage from "./pages/SignUpPage";
import Layout from "./ui/Layout";
import axiosInstance from "./axiosInstance";

function App() {
  const [user, setUser] = useState("");
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const res = await axiosInstance.post("/auth/signup", data);
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />}></Route>
        <Route path="/profile" element={<ProfilePage />}></Route>
        <Route path="/shop" element={<ShopPage />}></Route>
        <Route
          path="/signup"
          element={<SignUpPage handleSignUp={handleSignUp} />}
        ></Route>
        <Route path="*" element={<ErrorPage />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
