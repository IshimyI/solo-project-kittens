import { Routes, Route } from "react-router";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import SignUpPage from "./pages/SignUpPage";
import Layout from "./ui/Layout";
import axiosInstance, { setAccessToken } from "./axiosInstance";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import { useNavigate } from "react-router-dom";

function App() {
  const [user, setUser] = useState();
  const [products, setProducts] = useState([]);
  const [boughtProducts, setBoughtProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const increaseCoins = async () => {
    try {
      const res = await axiosInstance.post("/coins/increase", {
        userId: user.id,
      });

      setUser((prevUser) => ({ ...prevUser, coins: res.data.coins }));
    } catch (error) {
      console.error("Ошибка при увеличении коинов", error);
    }
  };

  const buyItem = async (product) => {
    if (user.coins < product.price) {
      alert("Недостаточно коинов!");
      return;
    }

    try {
      const newCoins = user.coins - product.price;
      const res = await axiosInstance.post("/coins/set", {
        userId: user.id,
        newCoins,
      });
      await axiosInstance.post("/inventory/add", {
        userId: user.id,
        itemId: product.id,
      });
      setUser((prevUser) => ({ ...prevUser, coins: res.data.coins }));
      setProducts((prevProducts) =>
        prevProducts.filter((el) => el.id !== product.id)
      );

      setBoughtProducts((prevBought) => [...prevBought, product]);
    } catch (error) {
      console.error("Ошибка при покупке", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/shop", {
          params: { userId: user?.id },
        });
        setProducts(res.data);
      } catch (error) {
        console.log("Ошибка загрузки товаров:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (!user) return;

    const fetchBoughtProducts = async () => {
      try {
        const res = await axiosInstance.get("/inventory", {
          params: { userId: user.id },
        });
        setBoughtProducts(res.data);
      } catch (error) {
        console.error("Ошибка загрузки купленных товаров:", error);
      }
    };

    fetchBoughtProducts();

    fetchProducts();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get("/message");
        const lastMessages = res.data.slice(-3);
        setMessages(lastMessages);
      } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
      }
    };

    axiosInstance("/tokens/refresh")
      .then((res) => {
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
      })
      .catch(() => {
        setUser(null);
        setAccessToken("");
        navigate("/signup");
      })
      .finally(() => {
        setLoadingUser(false);
      });

    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loadingUser) return <p>Загрузка пользователя...</p>;

  const handleSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const res = await axiosInstance.post("/auth/signup", data);
    if (res.status === 200) {
      setUser(res.data.user);
      setAccessToken(res.data.accessToken);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const res = await axiosInstance.post("/auth/login", data);
    if (res.status === 200) {
      setUser(res.data.user);
      setAccessToken(res.data.accessToken);
    }
  };

  const handleLogout = async () => {
    const res = await axiosInstance.post("/auth/logout");
    if (res.status === 200) {
      setUser(null);
      setAccessToken("");
      navigate("/login");
    }
  };

  return (
    <Routes>
      <Route element={<Layout user={user} handleLogout={handleLogout} />}>
        <Route
          path="/main"
          element={
            <MainPage
              user={user}
              increaseCoins={increaseCoins}
              messages={messages}
            />
          }
        ></Route>
        <Route
          path="/profile"
          element={<ProfilePage user={user} boughtProducts={boughtProducts} />}
        ></Route>
        <Route
          path="/shop"
          element={
            <ShopPage user={user} buyItem={buyItem} products={products} />
          }
        ></Route>
        <Route
          path="/signup"
          element={<SignUpPage handleSignUp={handleSignUp} />}
        ></Route>
        <Route
          path="/login"
          element={<LoginPage handleLogin={handleLogin} />}
        ></Route>
        <Route path="*" element={<ErrorPage />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
