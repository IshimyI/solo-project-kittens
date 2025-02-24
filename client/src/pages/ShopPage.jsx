import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import axiosInstance from "../axiosInstance";
import { NavLink, useNavigate } from "react-router-dom";

export default function ShopPage({ user, buyItem, products }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <>
      <h1 className="text-center text-3xl font-bold  m-3 bg-kitt-primary text-white px-4 py-2 rounded-lg mx-120">
        Магазин путешественника
      </h1>
      {products.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen text-kitt-txt">
          <div className="text-center p-6 rounded-lg shadow-lg bg-kitt-foreground max-w-lg mx-auto">
            <div className="mb-4"></div>
            <h1 className="text-4xl font-bold mb-4 text-white">
              Вы нашли все сокровища!
            </h1>
            <p className="text-xl text-kitt-secondary m-4">
              вы стали королем пиратов
            </p>
            <NavLink
              className="mt-6 px-6 py-2 text-white bg-kitt-primary rounded-lg hover:bg-kitt-secondary transition duration-300"
              to="/main"
            >
              Вернуться на главную
            </NavLink>
          </div>
        </div>
      ) : (
        <div className="card m-4 grid grid-cols-3 gap-16 px-12 py-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} buyItem={buyItem} />
          ))}
        </div>
      )}
    </>
  );
}
