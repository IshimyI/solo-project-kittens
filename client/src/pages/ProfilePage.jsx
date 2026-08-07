import React, { useEffect } from "react";
import "keen-slider/keen-slider.min.css";
import { useNavigate } from "react-router";

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
    <div
      style={{
        backgroundImage: `url(/imgs/default-wardrobe.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "87.5vh",
        position: "relative",
      }}
    >
      <h1 className="text-center text-3xl font-bold  m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg mx-120">
        Гардероб
      </h1>
      <div
        className="flex items-center justify-around overflow-y-hidden"
        style={{ height: "80vh" }}
      >
        <div className="mt-10 w-80 flex flex-col items-center">
          <div className="relative w-200 h-200 mt-6">
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
        <div className="flex flex-col">
          {[
            { category: "hat", selected: selectedHat },
            { category: "body", selected: selectedBody },
            { category: "coat", selected: selectedCoat },
          ].map(({ category, selected }, index) => {
            const { previous, current, next } = getAdjacentItems(
              wardrobe[category],
              selected
            );
            return previous && next ? (
              <div key={index} className="flex items-center space-x-4 ">
                <button onClick={() => equipItem(category, previous.Shop)}>
                  <img
                    src={`/imgs/${previous.Shop.path}.png`}
                    alt={previous.Shop.name}
                    className="w-36 h-36 rounded-lg shadow"
                  />
                </button>
                <img
                  src={`/imgs/${current.path}.png`}
                  alt={current.name}
                  className="w-60 h-60"
                />
                <button onClick={() => equipItem(category, next.Shop)}>
                  <img
                    src={`/imgs/${next.Shop.path}.png`}
                    alt={next.Shop.name}
                    className="w-36 h-36 rounded-lg shadow"
                  />
                </button>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
