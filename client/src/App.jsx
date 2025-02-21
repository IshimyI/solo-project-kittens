import { Routes, Route } from "react-router";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import SignUpPage from "./pages/SignUpPage";
import Layout from "./ui/Layout";
import axiosInstance, { setAccessToken } from "./axiosInstance";
import { useEffect, useRef, useState } from "react";
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
  const [countries, setCountries] = useState([]);
  const audioRef = useRef(new Audio("/sounds/background-music.mp3"));
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/background-music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.05;

    const savedState = localStorage.getItem("musicPlaying");
    if (savedState === "true") {
      audioRef.current.play();
      setIsPlaying(true);
    }

    return () => {
      audioRef.current.pause();
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    localStorage.setItem("musicPlaying", !isPlaying);
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const countryList = data.map(
          (country) => country.translations.rus.common
        );
        setCountries(countryList);
      } catch (error) {
        console.error("Ошибка загрузки стран:", error);
      }
    };

    fetchCountries();
  }, []);

  const sendMessage = async (newCoins) => {
    try {
      if (countries.length === 0) {
        console.warn("Список стран ещё не загружен.");
        return;
      }

      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];

      const str = `${user.name} прибыл в страну "${randomCountry}", скопив уже ${newCoins} коинов!`;

      const newMessage = { name: str };

      setMessages((prevMessages) => {
        const updatedMessages = [newMessage, ...prevMessages.slice(0, 2)];
        localStorage.setItem("messages", JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      await axiosInstance.post("/message", { name: str });
    } catch (error) {
      console.error("Ошибка при отправке сообщения", error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get("/message");
        console.log("Все сообщения:", res.data);

        const latestMessages = res.data.slice(-3);

        setMessages(latestMessages);
        localStorage.setItem("messages", JSON.stringify(latestMessages));
      } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
      }
    };

    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      fetchMessages();
    }
  }, []);

  const increaseCoins = async () => {
    try {
      const res = await axiosInstance.post("/coins/increase", {
        userId: user.id,
      });
      const newCoins = res.data.coins;

      setUser((prevUser) => ({ ...prevUser, coins: newCoins }));

      await sendMessage(newCoins);
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
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get("/message");
        console.log("Новые сообщения:", res.data);
        setMessages(res.data.slice(-3));
      } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
      }
    };

    fetchBoughtProducts();
    fetchMessages();

    fetchProducts();
  }, [user]);

  useEffect(() => {
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
      <Route
        element={
          <Layout
            user={user}
            handleLogout={handleLogout}
            toggleMusic={toggleMusic}
            isPlaying={isPlaying}
          />
        }
      >
        <Route
          path="/main"
          element={
            <MainPage
              user={user}
              increaseCoins={increaseCoins}
              messages={messages}
              sendMessage={sendMessage}
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
