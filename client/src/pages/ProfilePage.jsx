import React, { useEffect } from "react";
import "keen-slider/keen-slider.min.css";
import { useNavigate } from "react-router";

const ChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-7 h-7"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const arrowButtonClass =
  "w-12 h-12 flex items-center justify-center rounded-full bg-kitt-primary text-white shadow-lg hover:bg-kitt-secondary active:scale-90 transition-all duration-200";

export default function ProfilePage({
  user,
  boughtProducts,
  selectedHat,
  selectedBody,
  selectedCoat,
  equipmentLoaded,
  equipItem,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // overflow-hidden на самой странице не блокирует прокрутку — реально
  // скроллится body. Абсолютно позиционированные элементы гардероба могут
  // вылезать за границы вьюпорта по ширине, поэтому жёстко фиксируем
  // именно горизонтальный скролл на body, пока страница показана.
  useEffect(() => {
    const prevBodyOverflowX = document.body.style.overflowX;
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = prevBodyOverflowX;
      document.documentElement.style.overflowX = prevHtmlOverflowX;
    };
  }, []);

  // Группируем уже загруженный на уровне App список купленных вещей —
  // без отдельного похода в сеть при каждом заходе в гардероб.
  const wardrobe = {
    hat: boughtProducts
      .filter((item) => item.Shop && item.Shop.typeId === 1)
      .sort((a, b) => a.Shop.id - b.Shop.id),
    body: boughtProducts
      .filter((item) => item.Shop && item.Shop.typeId === 2)
      .sort((a, b) => a.Shop.id - b.Shop.id),
    coat: boughtProducts
      .filter((item) => item.Shop && item.Shop.typeId === 3)
      .sort((a, b) => a.Shop.id - b.Shop.id),
  };

  const isLoading = !equipmentLoaded;

  const getAdjacentItems = (array, selectedShopItem) => {
    if (!selectedShopItem)
      return { previous: null, current: null, next: null };

    const index = array.findIndex(
      (item) => item.Shop?.id === selectedShopItem.id
    );
    if (index === -1) return { previous: null, current: null, next: null };

    const previous = array[(index - 1 + array.length) % array.length] || null;
    const next = array[(index + 1) % array.length] || null;

    return { previous, current: selectedShopItem, next };
  };

  if (!user) return <p className="text-center text-xl mt-10">Загрузка...</p>;
  if (isLoading)
    return <p className="text-center text-xl mt-10">Загрузка гардероба...</p>;
  if (!wardrobe.hat.length && !wardrobe.body.length && !wardrobe.coat.length)
    return <p className="text-center text-xl mt-10">Гардероб пуст...</p>;

  return (
    <div className="relative h-full overflow-hidden bg-[length:auto_100%] bg-[36%_50%] bg-fixed md:bg-none bg-[url('/imgs/wardrobe-mobile-bg.png')]">
      {/* Десктопный фон — CSS background с repeat-x: растёт симметрично от
          центра (позиция не зависит от ширины контейнера), а когда картинки
          не хватает по бокам, она мягко продолжается повтором вместо
          обрыва в пустоту. */}
      <div
        className="hidden md:block absolute inset-0"
        style={{
          backgroundImage: "url(/imgs/wardrobe-main-bg2.png)",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "calc(50% - 300px) center",
        }}
      />

      <div className="flex justify-center pt-3">
        <h1 className="text-center text-lg md:text-3xl font-bold bg-kitt-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg w-[92%] max-w-[560px]">
          Гардероб
        </h1>
      </div>

      {/* Мобильный кот + стрелки — наложены друг на друга в одной точке:
          кот на заднем плане, ряды со стрелками поверх него. */}
      <div className="md:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4 pointer-events-none">
        <div className="relative shrink-0 w-200 h-200">
          {/* Кот — задний план, клики не перехватывает, чуть смещён влево */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ transform: "translate(-24px, 15px)" }}
          >
            {selectedCoat && (
              <img
                src={`/imgs/${selectedCoat.path}.png`}
                alt={selectedCoat.name || "Нет имени"}
                className="absolute w-full"
              />
            )}
            {selectedBody && (
              <img
                src={`/imgs/${selectedBody.path}.png`}
                alt={selectedBody.name || "Нет имени"}
                className="absolute w-full"
              />
            )}
            {selectedHat && (
              <img
                src={`/imgs/${selectedHat.path}.png`}
                alt={selectedHat.name || "Нет имени"}
                className="absolute w-full"
              />
            )}
          </div>

          {/* Стрелки — поверх кота, по центру той же области */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-20">
            {[
              { category: "hat", selected: selectedHat },
              { category: "body", selected: selectedBody },
              { category: "coat", selected: selectedCoat },
            ].map(({ category, selected }, index) => {
              const { previous, current, next } = getAdjacentItems(
                wardrobe[category],
                selected
              );
              if (!previous || !next) return null;
              return (
                <div key={index} className="flex items-center gap-56">
                  <button
                    onClick={() => equipItem(category, previous.Shop)}
                    className={`${arrowButtonClass} pointer-events-auto`}
                    aria-label="Предыдущий вариант"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => equipItem(category, next.Shop)}
                    className={`${arrowButtonClass} pointer-events-auto`}
                    aria-label="Следующий вариант"
                  >
                    <ChevronRight />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Десктопная версия — как было, без изменений. */}
      <div
        className="hidden md:flex items-center justify-center gap-16 overflow-visible w-[768px] max-w-full mx-auto"
        style={{ height: "100%" }}
      >
        {/* Размер и позиция — в процентах от высоты ЭТОГО контейнера
            (100% = высота страницы, как и у фона), а не в vh: vh считается
            от высоты всего окна браузера, что не совпадает с высотой
            страницы (минус хедер) и давало дрейф относительно фона при
            росте экрана. */}
        <div
          className="w-56 shrink-0 flex flex-col items-center"
          style={{ height: "100%" }}
        >
          <div
            className="relative"
            style={{ height: "87.5%", aspectRatio: "1 / 1", top: "calc(-4% + 150px)" }}
          >
            {selectedCoat && (
              <img
                src={`/imgs/${selectedCoat.path}.png`}
                alt={selectedCoat.name || "Нет имени"}
                className="absolute w-full z-[10]"
              />
            )}
            {selectedBody && (
              <img
                src={`/imgs/${selectedBody.path}.png`}
                alt={selectedBody.name || "Нет имени"}
                className="absolute w-full z-[30]"
              />
            )}
            {selectedHat && (
              <img
                src={`/imgs/${selectedHat.path}.png`}
                alt={selectedHat.name || "Нет имени"}
                className="absolute w-full z-[30]"
              />
            )}
          </div>
        </div>
        {/* Единый фон-шкаф с 3x3 полками — все 9 позиций (previous/current/next
            для hat/body/coat) размещены поверх него абсолютно, по координатам
            видимых полок на картинке. */}
        <div
          className="relative shrink-0"
          style={{ height: "73.4%", aspectRatio: "527 / 470", top: "-3.1%" }}
        >
          <img
            src="/imgs/wardrobe-shelf-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full"
          />

          {[
            { category: "hat", selected: selectedHat },
            { category: "body", selected: selectedBody },
            { category: "coat", selected: selectedCoat },
          ].map(({ category, selected }, index) => {
            const { previous, current, next } = getAdjacentItems(
              wardrobe[category],
              selected
            );
            if (!previous || !next) return null;
            const rowTop = ["22.8%", "50.4%", "77.9%"][index];
            return (
              <React.Fragment key={index}>
                <button
                  onClick={() => equipItem(category, previous.Shop)}
                  className="absolute"
                  style={{
                    left: "29.9%",
                    top: rowTop,
                    width: "21%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <img
                    src={`/imgs/${previous.Shop.path}.png`}
                    alt={previous.Shop.name}
                    className="w-full h-auto object-contain"
                  />
                </button>
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: "50%",
                    top: rowTop,
                    width: "24%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <img
                    src={`/imgs/${current.path}.png`}
                    alt={current.name}
                    className="w-full h-auto object-contain"
                  />
                </div>
                <button
                  onClick={() => equipItem(category, next.Shop)}
                  className="absolute"
                  style={{
                    left: "70%",
                    top: rowTop,
                    width: "21%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <img
                    src={`/imgs/${next.Shop.path}.png`}
                    alt={next.Shop.name}
                    className="w-full h-auto object-contain"
                  />
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
