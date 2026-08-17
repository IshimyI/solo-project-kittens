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
import Toast from "./ui/Toast";
import { COUNTRIES } from "./data/countries";

// Базовый список нецензурных корней (рус/англ) для проверки логина при
// регистрации — простая проверка подстрокой, без претензии на 100%
// защиту от обхода, но отсекает явные случаи.
const PROFANITY_PATTERNS = [
  /хуй/i, /хуе/i, /хуя/i, /хуё/i, /пизд/i, /еба/i, /ёба/i, /ебл/i, /ебу/i,
  /бляд/i, /блять/i, /сука/i, /мудак/i, /гандон/i, /долбоеб/i, /долбоёб/i,
  /залуп/i, /пидор/i, /пидар/i, /fuck/i, /shit/i, /bitch/i, /asshole/i, /cunt/i,
];
const containsProfanity = (text) => PROFANITY_PATTERNS.some((re) => re.test(text));

function App() {
  const [user, setUser] = useState();
  // Очередь баннеров — не больше 3 одновременно, при переполнении первым
  // (самым старым) исчезает без анимации, остальные — по своему таймеру, с
  // плавным схлопыванием (см. Toast.jsx).
  const [toasts, setToasts] = useState([]);
  const showToast = (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
  };
  const dismissToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
      // Браузер блокирует автовоспроизведение без предварительного
      // взаимодействия пользователя со страницей — ловим отказ, чтобы не
      // падать в консоль необработанным промисом, и держим isPlaying в
      // соответствии с реальным состоянием звука, а не с оптимистичной
      // догадкой.
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
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
      audioRef.current.play().catch(() => {});
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

  // Журнал общий для всех, и сервер — единственный источник правды.
  // Раньше здесь ещё оптимистично добавляли своё сообщение локально, но
  // это конфликтовало с фоновым опросом (сообщение мигало/пропадало/
  // прыгало по порядку) — особенно заметно, когда путешествуют сразу
  // несколько человек. Теперь только один путь обновления: сервер.
  const fetchMessagesRef = useRef(() => {});
  const fetchBoughtProductsRef = useRef(() => {});

  const sendMessage = async (newCoins, destination) => {
    try {
      const str = `${user.name} прибыл в страну "${destination.ru}", скопив уже ${newCoins} монет!`;
      await axiosInstance.post("/message", { name: str });
      // Подтягиваем журнал сразу же, не дожидаясь следующего опроса —
      // своя запись появляется мгновенно, без гонки с polling'ом.
      fetchMessagesRef.current();
    } catch (error) {
      console.error("Ошибка при отправке сообщения", error);
    }
  };

  // Показываем закэшированную копию сразу (чтобы не мигало пустым при
  // заходе), а дальше опрашиваем сервер каждые несколько секунд — так
  // видно и чужие путешествия из других вкладок/сессий.
  useEffect(() => {
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get("/message");
        if (cancelled) return;

        const latestMessages = res.data.slice(-5);
        setMessages(latestMessages);
        localStorage.setItem("messages", JSON.stringify(latestMessages));
      } catch (error) {
        console.error("Ошибка загрузки сообщений:", error);
      }
    };

    fetchMessagesRef.current = fetchMessages;
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const increaseCoins = async (destination) => {
    try {
      const res = await axiosInstance.post("/coins/increase");
      const newCoins = res.data.coins;

      setUser((prevUser) => ({ ...prevUser, coins: newCoins }));

      await sendMessage(newCoins, destination);
    } catch (error) {
      console.error("Ошибка при увеличении коинов", error);
    }
  };

  const buyItem = async (product) => {
    if (user.coins < product.price) {
      showToast("error", "Недостаточно монет!");
      return;
    }

    try {
      const res = await axiosInstance.post("/shop/buy", {
        itemId: product.id,
      });
      setUser((prevUser) => ({ ...prevUser, coins: res.data.coins }));
      setProducts((prevProducts) =>
        prevProducts.filter((el) => el.id !== product.id)
      );

      // Раньше сюда пушился "плоский" товар без вложенного .Shop, из-за
      // чего гардероб на ProfilePage (ждёт item.Shop.typeId/.Shop.id) не
      // находил только что купленную вещь ни в одном направлении карусели.
      // Перезапрашиваем инвентарь с сервера — форма гарантированно верная.
      await fetchBoughtProductsRef.current();
      showToast("success", "Покупка успешно совершена!");
    } catch (error) {
      console.error("Ошибка при покупке", error);
      const message =
        error.response?.data?.message ||
        "Не удалось совершить покупку. Попробуйте снова.";
      showToast("error", message);
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
        selectedItems: { hat: hatId, body: bodyId, coat: coatId },
      })
      .catch((error) =>
        console.error("Ошибка при обновлении выбранных элементов:", error.message)
      );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/shop");
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
        const res = await axiosInstance.get("/inventory");
        setBoughtProducts(res.data);
      } catch (error) {
        console.error("Ошибка загрузки купленных товаров:", error);
      }
    };
    fetchBoughtProductsRef.current = fetchBoughtProducts;
    const fetchEquipment = async () => {
      try {
        const selected = await axiosInstance.get("/user-selected-items");
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

    const name = (data.name || "").trim();
    const email = (data.email || "").trim();
    const password = data.password || "";

    if (name.length < 2 || name.length > 20) {
      showToast("error", "Логин должен быть от 2 до 20 символов.");
      return;
    }
    if (!/^[a-zA-Zа-яА-ЯёЁ0-9 _-]+$/.test(name)) {
      showToast("error", "Логин может содержать только буквы, цифры, пробел, - и _.");
      return;
    }
    if (containsProfanity(name)) {
      showToast("error", "Логин содержит недопустимые слова.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("error", "Введите корректную почту.");
      return;
    }
    if (password.length < 6) {
      showToast("error", "Пароль должен быть не короче 6 символов.");
      return;
    }

    try {
      const res = await axiosInstance.post("/auth/signup", { name, email, password });
      if (res.status === 200) {
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
      }
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Не удалось зарегистрироваться. Попробуйте снова."
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res.status === 200) {
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
      }
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Неверная почта или пароль."
      );
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
    <>
      <Toast toasts={toasts} onDismiss={dismissToast} />
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
            <ShopPage user={user} buyItem={buyItem} products={products} loading={loading} />
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
    </>
  );
}

export default App;
