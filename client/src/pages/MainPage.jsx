import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import axios from "axios";

export default function MainPage({
  user,
  increaseCoins,
  messages,
  sendMessage,
}) {
  const [selectedHat, setSelectedHat] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);
  const [selectedCoat, setSelectedCoat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState(
    "/imgs/default-background.jpg"
  );

  const navigate = useNavigate();

  const fetchBackground = async () => {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/photos/random?client_id=ZhgmCvtObGLYrhK3MuvG8d-I7j9AAs-DNRM7zlmAtOQ&query=landscape"
      );

      console.log("Ответ от Unsplash:", response.data.urls.regular);

      const imageUrl = response.data.urls.regular;
      setBackgroundUrl(imageUrl);
    } catch (error) {
      console.error("Ошибка загрузки фона:", error);
    }
  };

  const handleClick = () => {
    if (isButtonDisabled) return;

    increaseCoins();
    setIsButtonDisabled(true);
    fetchBackground();

    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 5000);
  };

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
        const body = await axiosInstance.get("/shopbypk", {
          params: { id: res.data.body },
        });
        const coat = await axiosInstance.get("/shopbypk", {
          params: { id: res.data.coat },
        });

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
