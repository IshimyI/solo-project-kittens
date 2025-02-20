import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";

export default function MainPage({ user, increaseCoins, messages }) {
  const [selectedHat, setSelectedHat] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedCoat, setSelectedCoat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelectedItems = async () => {
      if (!user) return;

      try {
        const res = await axiosInstance.get("/user-selected-items", {
          params: { userId: user.id },
        });
        const hat = await axiosInstance.get("/shopbypk", {
          params: { id: res.data.hat },
        });
        console.log(hat);
        const body = await axiosInstance.get("/shopbypk", {
          params: { id: res.data.body },
        });
        console.log(body);

        const coat = await axiosInstance.get("/shopbypk", {
          params: { id: res.data.coat },
        });
        console.log(coat);

        setSelectedHat(hat.data || null);
        setSelectedBody(body.data || null);
        setSelectedCoat(coat.data || null);
      } catch (error) {
        console.error("Ошибка загрузки выбранных предметов:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedItems();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return <p>Загрузка...</p>;
  }

  if (!user) return <p className="text-center text-xl mt-10">Загрузка...</p>;
  if (isLoading)
    return <p className="text-center text-xl mt-10">Загрузка гардероба...</p>;

  return (
    <>
      <h2>{`${user.coins} уже заработано`}</h2>
      <button
        className="m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition"
        onClick={increaseCoins}
      >
        Жмакай
      </button>
      <p>{`${messages}11`}</p>
      <div className="flex items-center justify-around min-h-screen py-10">
        <div className="h-24 w-80 flex flex-col items-center">
          {console.log(selectedCoat)}
          {selectedCoat ? (
            <img
              src={`/imgs/${selectedCoat.path}.png`}
              alt={selectedCoat.name || "Нет имени"}
              className="absolute w-full z-[10]"
            />
          ) : (
            <p>Пальто не выбрано</p>
          )}
          {selectedBody ? (
            <img
              src={`/imgs/${selectedBody.path}.png`}
              alt={selectedBody.name || "Нет имени"}
              className="absolute w-full z-[30]"
            />
          ) : (
            <p>Тело не выбрано</p>
          )}
          {selectedHat ? (
            <img
              src={`/imgs/${selectedHat.path}.png`}
              alt={selectedHat.name || "Нет имени"}
              className="absolute w-full z-[30]"
            />
          ) : (
            <p>Шляпа не выбрана</p>
          )}
        </div>
      </div>
    </>
  );
}
