import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router";
import { useNavigate } from "react-router-dom";
import axiosInstance, { setAccessToken } from "./axiosInstance";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import Layout from "./ui/Layout";
import { COUNTRIES } from "./data/countries";

function App() {
  const [user, setUser] = useState();
  const [products, setProducts] = useState([]);
  const [boughtProducts, setBoughtProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const [countries] = useState(COUNTRIES);
  const audioRef = useRef(new Audio("/sounds/background-music.mp3"));
  const [isPlaying, setIsPlaying] = useState(false);
  const [place, setPlace] = useState(null);
  // Экипировка (шляпа/тело/пальто) хранится тут, а не в самих страницах —
  // грузится один раз при входе и не пропадает при переходах между
  // /main и /profile, поэтому навигация между ними мгновенная.
  const [selectedHat, setSelectedHat] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedCoat, setSelectedCoat] = useState(null);
  const [equipmentLoaded, setEquipmentLoaded] = useState(false);
  // Следующее направление выбирается заранее, чтобы MainPage успел
  // предзагрузить его фон в фоне — при клике переключение мгновенное,
  // без паузы на загрузку.
  const [nextPlace, setNextPlace] = useState(null);

  const pickRandomCountry = () =>
    countries[Math.floor(Math.random() * countries.length)];

  useEffect(() => {
    setNextPlace(pickRandomCountry());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Синхронно переключает место назначения на уже предзагруженное
  // nextPlace — вызывается прямо по клику, без ожидания сети, поэтому
  // фон меняется сразу в начале анимации, а не когда-то потом.
  const travelToNextPlace = () => {
    const destination = nextPlace || pickRandomCountry();
    setPlace(destination);
    // Сразу намечаем следующее направление — MainPage начнёт тихо
    // подгружать его фон на все 4 секунды текущей анимации.
    setNextPlace(pickRandomCountry());
    return destination;
  };

  const sendMessage = async (newCoins, destination) => {
    try {
      const str = `${user.name} прибыл в страну "${destination.ru}", скопив уже ${newCoins} коинов!`;
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

  const increaseCoins = async (destination) => {
    try {
      const res = await axiosInstance.post("/coins/increase", {
        userId: user.id,
      });
      const newCoins = res.data.coins;

      setUser((prevUser) => ({ ...prevUser, coins: newCoins }));

      await sendMessage(newCoins, destination);
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

  // Экипировка предмета: обновляем состояние сразу (оптимистично, без
  // повторной загрузки со страницы), запрос на сервер уходит в фоне.
  // item — плоский объект товара (та же форма, что отдаёт /shopbypk).
  const equipItem = (category, item) => {
    const setters = {
      hat: setSelectedHat,
      body: setSelectedBody,
      coat: setSelectedCoat,
    };
    setters[category]?.(item);

    const hatId = category === "hat" ? item?.id : selectedHat?.id;
    const bodyId = category === "body" ? item?.id : selectedBody?.id;
    const coatId = category === "coat" ? item?.id : selectedCoat?.id;
    if (!hatId || !bodyId || !coatId || !user) return;

    axiosInstance
      .put("/user-selected-items", {
        userId: user.id,
        selectedItems: { hat: hatId, body: bodyId, coat: coatId },
      })
      .catch((error) =>
        console.error("Ошибка при обновлении выбранных элементов:", error.message)
      );
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

    const fetchEquipment = async () => {
      try {
        const selected = await axiosInstance.get("/user-selected-items", {
          params: { userId: user.id },
        });
        // Три запроса параллельно вместо последовательных — втрое быстрее.
        const [hat, body, coat] = await Promise.all([
          axiosInstance.get("/shopbypk", { params: { id: selected.data.hat } }),
          axiosInstance.get("/shopbypk", { params: { id: selected.data.body } }),
          axiosInstance.get("/shopbypk", { params: { id: selected.data.coat } }),
        ]);
        setSelectedHat(hat.data || null);
        setSelectedBody(body.data || null);
        setSelectedCoat(coat.data || null);
      } catch (error) {
        console.error("Ошибка загрузки выбранных предметов:", error.message);
      } finally {
        setEquipmentLoaded(true);
      }
    };

    fetchBoughtProducts();
    fetchMessages();
    fetchEquipment();

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
              travelToNextPlace={travelToNextPlace}
              messages={messages}
              place={place}
              nextPlace={nextPlace}
              selectedHat={selectedHat}
              selectedBody={selectedBody}
              selectedCoat={selectedCoat}
              equipmentLoaded={equipmentLoaded}
            />
          }
        ></Route>
        <Route
          path="/profile"
          element={
            <ProfilePage
              user={user}
              boughtProducts={boughtProducts}
              selectedHat={selectedHat}
              selectedBody={selectedBody}
              selectedCoat={selectedCoat}
              equipmentLoaded={equipmentLoaded}
              equipItem={equipItem}
            />
          }
        ></Route>
        <Route
          path="/shop"
          element={
            <ShopPage user={user} buyItem={buyItem} products={products} />
          }
        ></Route>
        <Route
          path="/signup"
          element={<SignUpPage handleSignUp={handleSignUp} user={user} />}
        ></Route>
        <Route
          path="/login"
          element={<LoginPage handleLogin={handleLogin} user={user} />}
        ></Route>
        <Route path="*" element={<ErrorPage />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
