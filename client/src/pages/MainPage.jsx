import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Записи журнала вида '...скопив уже 100 коинов!' — подставляем иконку
// монеты прямо рядом с числом вместо голого текста.
function renderMessageWithCoinIcon(text) {
  // Матчим и старое "коинов", и новое "монет" — старые записи в БД ещё
  // хранят прежнее слово, но показываем всегда единообразно "монет".
  const match = text.match(/(\d+)(\s*(?:коинов|монет))/);
  if (!match) return text;

  const [full, amount] = match;
  const index = match.index;
  const before = text.slice(0, index);
  const after = text.slice(index + full.length);

  return (
    <>
      {before}
      {amount}
      <img
        src="/coin-icon.png"
        alt=""
        className="inline-block w-4 h-4 mx-1 -mt-0.5"
      />
      монет
      {after}
    </>
  );
}

// На мобильных (< sm, 640px) журнал показывает меньше записей — на
// десктопе поведение прежнее.
const JOURNAL_VISIBLE_COUNT_DESKTOP = 5;
const JOURNAL_VISIBLE_COUNT_MOBILE = 2;

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
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const JOURNAL_VISIBLE_COUNT = isMobile
    ? JOURNAL_VISIBLE_COUNT_MOBILE
    : JOURNAL_VISIBLE_COUNT_DESKTOP;

  // Просто последние JOURNAL_VISIBLE_COUNT записей — без обрезки текста и
  // без точной покадровой сдвижки (та требовала фиксированной высоты
  // строки, из-за чего длинные сообщения обрезались).
  const displayMessages = messages.slice(-JOURNAL_VISIBLE_COUNT);
  const lastMessageKeyRef = useRef(null);
  const newestKey =
    displayMessages.length > 0
      ? `${displayMessages[displayMessages.length - 1].name}-${messages.length}`
      : null;

  useEffect(() => {
    lastMessageKeyRef.current = newestKey;
  }, [newestKey]);

  const [backgroundUrl, setBackgroundUrl] = useState(
    () => localStorage.getItem("background_last") || "/imgs/default-background.jpg"
  );
  // countryNameEn -> Promise<string|null>, общий для текущего показа и
  // фоновой предзагрузки, чтобы никто не "терял" уже идущий запрос.
  const inFlight = useRef(new Map());

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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

    // Кэш только что предзагруженного nextPlace нельзя трогать — он вот-вот
    // понадобится для мгновенного переключения фона. Раньше чистка ниже
    // сортировала ключи по алфавиту URL-адреса (а не по актуальности) и
    // могла случайно удалить именно его прямо перед переходом — из-за
    // этого подгрузка "работала через раз".
    const protectedKeys = new Set(
      [place?.en, nextPlace?.en]
        .filter(Boolean)
        .map((en) => `background_${en}`)
    );

    const backgroundKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith("background_") && !protectedKeys.has(key)
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
    }, 5000);
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
        height: "100%",
        position: "relative",
      }}
    >
      <div className="flex flex-col items-center gap-2 md:gap-3 pt-3">
        <h1 className="text-center text-lg md:text-3xl font-bold bg-kitt-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg w-[92%] max-w-[560px] md:w-[560px]">
          Путешествие начинается здесь
        </h1>

        {/* С 640px кнопка+монеты и журнал идут в один ряд: кнопка сверху,
            монеты под ней, журнал — рядом. До 640px — прежнее поведение
            (кнопка+монеты в строку, журнал отдельно абсолютным блоком). */}
        <div className="flex flex-row sm:items-start items-center gap-2 sm:gap-6">
          <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-3">
            <button
              className={`bg-kitt-primary text-white text-xs sm:text-base px-4 py-2 sm:px-8 sm:py-4 rounded-full shadow-2xl hover:bg-kitt-secondary transition-all duration-500 ${
                isButtonDisabled ? "opacity-50 cursor-not-allowed" : "scale-105"
              }`}
              onClick={handleClick}
              disabled={isButtonDisabled}
            >
              {isButtonDisabled ? (
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="animate-bounce">🐾</span>
                  В пути...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 sm:gap-2">
                  Отправиться в путь
                  <span>🧭</span>
                </span>
              )}
            </button>

            {user.coins != null && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-kitt-background/85 backdrop-blur-sm text-kitt-txt px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg text-xs sm:text-base">
                <img src="/coin-icon.png" alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">{user.coins} монет</span>
              </div>
            )}
          </div>

          {/* Только промежуточный диапазон 640–767px — на полноценном
              десктопе (768px+) журнал возвращается к оригинальному виду,
              приклеенному к низу страницы (см. блок ниже). */}
          <div className="hidden sm:block md:hidden w-72 bg-kitt-background bg-opacity-85 backdrop-blur-sm text-kitt-txt p-4 rounded-lg shadow-2xl">
            <h2 className="text-lg font-bold text-kitt-primary mb-2">
              Журнал путешественников
            </h2>
            {displayMessages.length === 0 ? (
              <p className="text-sm text-kitt-txt/60 italic">
                Пока никто не путешествовал — будь первым!
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {displayMessages.map((message, index) => {
                  const key = `${message.name}-${displayMessages.length}-${index}`;
                  const isNewest = index === displayMessages.length - 1;
                  return (
                    <div
                      key={key}
                      className={`bg-kitt-primary text-white rounded-lg hover:bg-kitt-secondary transition-colors duration-300 px-3 py-2 ${
                        isNewest && key !== lastMessageKeyRef.current ? "journal-mount" : ""
                      }`}
                    >
                      <span className="text-sm leading-snug break-words">
                        {renderMessageWithCoinIcon(message.name)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Оригинальный десктопный журнал (768px+) — приклеен к низу страницы,
          как было изначально, без изменений. */}
      <div className="hidden md:block absolute bottom-5 w-96 bg-kitt-background bg-opacity-85 backdrop-blur-sm text-kitt-txt p-6 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-kitt-primary mb-4">
          Журнал путешественников
        </h2>
        {displayMessages.length === 0 ? (
          <p className="text-sm text-kitt-txt/60 italic">
            Пока никто не путешествовал — будь первым!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {displayMessages.map((message, index) => {
              const key = `${message.name}-${displayMessages.length}-${index}`;
              const isNewest = index === displayMessages.length - 1;
              return (
                <div
                  key={key}
                  className={`bg-kitt-primary text-white rounded-lg hover:bg-kitt-secondary transition-colors duration-300 px-3 py-2 ${
                    isNewest && key !== lastMessageKeyRef.current ? "journal-mount" : ""
                  }`}
                >
                  <span className="text-base leading-snug break-words">
                    {renderMessageWithCoinIcon(message.name)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* До 640px журнал остаётся отдельным абсолютным блоком, как раньше. */}
      <div className="absolute sm:hidden top-28 left-1/2 -translate-x-1/2 w-[80%] max-w-72 bg-kitt-background/50 backdrop-blur-sm text-kitt-txt p-3 rounded-lg shadow-md opacity-70 hover:opacity-100 transition-opacity duration-300">
        <h2 className="text-xs font-bold text-kitt-primary mb-2">
          Журнал путешественников
        </h2>
        {displayMessages.length === 0 ? (
          <p className="text-xs text-kitt-txt/60 italic">
            Пока никто не путешествовал — будь первым!
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {displayMessages.map((message, index) => {
              const key = `${message.name}-${displayMessages.length}-${index}`;
              const isNewest = index === displayMessages.length - 1;
              return (
                <div
                  key={key}
                  className={`bg-kitt-primary text-white rounded-lg hover:bg-kitt-secondary transition-colors duration-300 px-3 py-2 ${
                    isNewest && key !== lastMessageKeyRef.current ? "journal-mount" : ""
                  }`}
                >
                  <span className="text-xs leading-snug break-words">
                    {renderMessageWithCoinIcon(message.name)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
              className="absolute w-160 z-[10] top-75 drop-shadow-2xl"
            />
          ) : (
            <p>Пальто не выбрано</p>
          )}
          {selectedBody ? (
            <img
              src={`/imgs/${selectedBody.path}.png`}
              alt={selectedBody.name || "Нет имени"}
              className="absolute w-160 z-[30] top-75 drop-shadow-2xl"
            />
          ) : (
            <p>Тело не выбрано</p>
          )}
          {selectedHat ? (
            <img
              src={`/imgs/${selectedHat.path}.png`}
              alt={selectedHat.name || "Нет имени"}
              className="absolute w-160 z-[30] top-75 drop-shadow-2xl"
            />
          ) : (
            <p>Шляпа не выбрана</p>
          )}
        </div>
      </div>
    </div>
  );
}
