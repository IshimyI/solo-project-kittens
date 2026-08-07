import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MainPage({
  user,
  increaseCoins,
  travelToNextPlace,
  messages,
  place,
  nextPlace,
  selectedHat,
  selectedBody,
  selectedCoat,
  equipmentLoaded,
}) {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState(
    () => localStorage.getItem("background_last") || "/imgs/default-background.jpg"
  );
  // countryNameEn -> Promise<string|null>, общий для текущего показа и
  // фоновой предзагрузки, чтобы никто не "терял" уже идущий запрос.
  const inFlight = useRef(new Map());

  const navigate = useNavigate();

  const preloadImage = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(url);
      img.src = url;
    });

  // Возвращает URL фона для страны: из кэша мгновенно, иначе запрашивает
  // (переиспользуя уже идущий запрос, если он есть) и ждёт, пока картинка
  // реально не будет декодирована браузером — только тогда résolve.
  const getBackgroundUrl = (countryNameEn) => {
    const cacheKey = `background_${countryNameEn}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return Promise.resolve(cached);

    if (inFlight.current.has(countryNameEn)) {
      return inFlight.current.get(countryNameEn);
    }

    const promise = (async () => {
      try {
        // Запрос всегда идёт по английскому названию страны — так поиск
        // Unsplash куда надёжнее находит фото, которые реально
        // соответствуют стране. Личный ключ (не общий демо-ключ) — свой
        // лимит 50 запросов/час, плюс жёсткий таймаут.
        const query = encodeURIComponent(`${countryNameEn} landmark`);
        const response = await axios.get(
          `https://api.unsplash.com/photos/random?client_id=${
            import.meta.env.VITE_UNSPLASH_ACCESS_KEY
          }&query=${query}&orientation=landscape`,
          { timeout: 4000 }
        );

        const imageUrl = response.data.urls.regular;
        await preloadImage(imageUrl);
        localStorage.setItem(cacheKey, imageUrl);
        localStorage.setItem("background_last", imageUrl);
        return imageUrl;
      } catch (error) {
        console.error("Ошибка загрузки фона:", error.message);
        return null;
      } finally {
        inFlight.current.delete(countryNameEn);
      }
    })();

    inFlight.current.set(countryNameEn, promise);
    return promise;
  };

  // Фон текущего места — если он уже был предзагружен заранее (см. ниже),
  // подставляется мгновенно из кэша, без похода в сеть.
  useEffect(() => {
    if (!place?.en) return;
    let cancelled = false;

    getBackgroundUrl(place.en).then((imageUrl) => {
      if (cancelled) return;
      if (imageUrl) {
        setBackgroundUrl(imageUrl);
      } else {
        const lastGoodBackground = localStorage.getItem("background_last");
        if (lastGoodBackground) setBackgroundUrl(lastGoodBackground);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [place]);

  // Тихая предзагрузка фона для СЛЕДУЮЩЕГО направления — качается в фоне,
  // пока пользователь смотрит на текущее, и не трогает видимую картинку.
  useEffect(() => {
    if (nextPlace?.en) getBackgroundUrl(nextPlace.en);
  }, [nextPlace]);

  const handleClick = () => {
    if (isButtonDisabled) return;

    const backgroundKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("background_")
    );

    if (backgroundKeys.length > 3) {
      backgroundKeys
        .sort((a, b) =>
          localStorage.getItem(b).localeCompare(localStorage.getItem(a))
        )
        .slice(3)
        .forEach((key) => localStorage.removeItem(key));
    }

    // Место назначения меняется синхронно, прямо сейчас — фон переключается
    // мгновенно (он уже предзагружен заранее). Начисление монет и запись
    // в журнал идут в фоне и на визуальную смену уже не влияют.
    const destination = travelToNextPlace();
    increaseCoins(destination);
    setIsButtonDisabled(true);

    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 4000);
  };

  if (!user) {
    return <p>Загрузка...</p>;
  }

  if (!equipmentLoaded)
    return <p className="text-center text-xl mt-10">Загрузка гардероба...</p>;

  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "89vh",
        position: "relative",
      }}
    >
      <h1 className="text-center text-3xl font-bold m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg mx-120">
        Путешествие начинается здесь
      </h1>
      <button
        className={`bg-kitt-primary text-white px-8 py-4 rounded-full shadow-2xl hover:bg-kitt-secondary transition-all duration-500 ${
          isButtonDisabled ? "opacity-50 cursor-not-allowed" : "scale-105"
        }`}
        onClick={handleClick}
        disabled={isButtonDisabled}
        style={{
          transform: "translateX(300%)",
        }}
      >
        Попутешествовать
      </button>

      <div className="absolute bottom-5   w-96 bg-kitt-background bg-opacity-80 text-kitt-txt p-6 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-kitt-primary mb-4">
          Журнал путешественников
        </h2>
        {messages.map((message, index) => (
          <div
            key={index}
            className="bg-kitt-primary text-white p-3 rounded-lg mb-2 hover:bg-kitt-secondary transition-all duration-300"
          >
            {message.name}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-around ">
        <div
          className={`h-24 w-80 flex flex-col items-center ${
            isButtonDisabled ? "swing" : ""
          }`}
        >
          {selectedCoat ? (
            <img
              src={`/imgs/${selectedCoat.path}.png`}
              alt={selectedCoat.name || "Нет имени"}
              className="absolute w-160 z-[10] top-75"
            />
          ) : (
            <p>Пальто не выбрано</p>
          )}
          {selectedBody ? (
            <img
              src={`/imgs/${selectedBody.path}.png`}
              alt={selectedBody.name || "Нет имени"}
              className="absolute w-160 z-[30] top-75"
            />
          ) : (
            <p>Тело не выбрано</p>
          )}
          {selectedHat ? (
            <img
              src={`/imgs/${selectedHat.path}.png`}
              alt={selectedHat.name || "Нет имени"}
              className="absolute w-160 z-[30] top-75"
            />
          ) : (
            <p>Шляпа не выбрана</p>
          )}
        </div>
      </div>
    </div>
  );
}
