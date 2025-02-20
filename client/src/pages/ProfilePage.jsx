import React, { useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router";

export default function ProfilePage({ user, boughtProducts }) {
  const [wardrobe, setWardrobe] = useState({ hat: [], body: [], coat: [] });
  const [selectedHat, setSelectedHat] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedCoat, setSelectedCoat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchBoughtProducts = async () => {
      try {
        const res = await axiosInstance.get("/inventory", {
          params: { userId: user.id },
        });

        const validData = res.data.filter(
          (item) => item && item.Shop && item.Shop.typeId
        );

        const filteredData = res.data
          .filter((item) => item.User.id === user.id)
          .sort((a, b) => a.Shop.id - b.Shop.id);

        const groupedProducts = {
          hat: filteredData.filter(
            (item) => item.Shop && item.Shop.typeId === 1
          ),
          body: filteredData.filter(
            (item) => item.Shop && item.Shop.typeId === 2
          ),
          coat: filteredData.filter(
            (item) => item.Shop && item.Shop.typeId === 3
          ),
        };

        setWardrobe(groupedProducts);
      } catch (error) {
        console.error("Ошибка загрузки гардероба:", error.message);
      }
    };

    fetchBoughtProducts();
  }, [user]);

  useEffect(() => {
    const fetchSelectedItems = async () => {
      if (!user) return;

      try {
        const res = await axiosInstance.get("/user-selected-items", {
          params: { userId: user.id },
        });

        setSelectedHat(
          wardrobe.hat.find((item) => item.Shop.id === res.data.hat) ||
            wardrobe.hat[0]
        );
        setSelectedBody(
          wardrobe.body.find((item) => item.Shop.id === res.data.body) ||
            wardrobe.body[0]
        );
        setSelectedCoat(
          wardrobe.coat.find((item) => item.Shop.id === res.data.coat) ||
            wardrobe.coat[0]
        );
      } catch (error) {
        console.error("Ошибка загрузки выбранных предметов:", error.message);

        if (wardrobe.hat.length) setSelectedHat(wardrobe.hat[0]);
        if (wardrobe.body.length) setSelectedBody(wardrobe.body[0]);
        if (wardrobe.coat.length) setSelectedCoat(wardrobe.coat[0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedItems();
  }, [wardrobe, user]);

  useEffect(() => {
    const updateSelectedItems = async () => {
      if (!user || !selectedHat || !selectedBody || !selectedCoat) return;

      try {
        await axiosInstance.put("/user-selected-items", {
          userId: user.id,
          selectedItems: {
            hat: selectedHat.Shop.id,
            body: selectedBody.Shop.id,
            coat: selectedCoat.Shop.id,
          },
        });
        console.log(
          await axiosInstance.get(`/user-selected-items?userId=${user.id}`)
        );
      } catch (error) {
        console.error(
          "Ошибка при обновлении выбранных элементов:",
          error.message
        );
      }
    };

    updateSelectedItems();
  }, [selectedHat, selectedBody, selectedCoat, user]);

  const getAdjacentItems = (array, selectedItem) => {
    if (!selectedItem?.Shop)
      return { previous: null, current: null, next: null };

    const index = array.findIndex(
      (item) => item.Shop?.id === selectedItem.Shop?.id
    );
    if (index === -1) return { previous: null, current: null, next: null };

    const previous = array[(index - 1 + array.length) % array.length] || null;
    const next = array[(index + 1) % array.length] || null;

    return { previous, current: selectedItem, next };
  };

  if (!user) return <p className="text-center text-xl mt-10">Загрузка...</p>;
  if (isLoading)
    return <p className="text-center text-xl mt-10">Загрузка гардероба...</p>;
  if (!wardrobe.hat.length && !wardrobe.body.length && !wardrobe.coat.length)
    return <p className="text-center text-xl mt-10">Гардероб пуст...</p>;

  return (
    <>
      <h3 className="text-xl font-bold text-gray-700 text-center">
        🎭 Гардероб
      </h3>
      <div className="flex items-center justify-around min-h-screen py-10">
        <div className="mt-10 w-80 flex flex-col items-center">
          <div className="relative w-96 h-96 mt-6">
            {selectedCoat?.Shop && (
              <img
                src={`/imgs/${selectedCoat.Shop.path}.png`}
                alt={selectedCoat.Shop.name || "Нет имени"}
                className="absolute w-full z-[10]"
              />
            )}
            {selectedBody?.Shop && (
              <img
                src={`/imgs/${selectedBody.Shop.path}.png`}
                alt={selectedBody.Shop.name || "Нет имени"}
                className="absolute w-full z-[30]"
              />
            )}
            {selectedHat?.Shop && (
              <img
                src={`/imgs/${selectedHat.Shop.path}.png`}
                alt={selectedHat.Shop.name || "Нет имени"}
                className="absolute w-full z-[30]"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          {[
            { category: "hat", selected: selectedHat, set: setSelectedHat },
            { category: "body", selected: selectedBody, set: setSelectedBody },
            { category: "coat", selected: selectedCoat, set: setSelectedCoat },
          ].map(({ category, selected, set }, index) => {
            const { previous, current, next } = getAdjacentItems(
              wardrobe[category],
              selected
            );
            return previous && next ? (
              <div key={index} className="flex items-center space-x-4 mt-4">
                <button
                  onClick={() => {
                    console.log("Setting previous:", previous);
                    set(previous);
                  }}
                >
                  <img
                    src={`/imgs/${previous.Shop.path}.png`}
                    alt={previous.Shop.name}
                    className="w-36 h-36 rounded-lg shadow"
                  />
                </button>
                <img
                  src={`/imgs/${current.Shop.path}.png`}
                  alt={current.Shop.name}
                  className="w-60 h-60"
                />
                <button
                  onClick={() => {
                    console.log("Setting next:", next);
                    set(next);
                  }}
                >
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
    </>
  );
}
