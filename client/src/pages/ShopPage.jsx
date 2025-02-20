import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import axiosInstance from "../axiosInstance";
import { useNavigate } from "react-router-dom";

export default function ShopPage({ user, buyItem, products }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <>
      <h1 className="text-center text-3xl font-bold underline">
        Магазин путешественника
      </h1>
      {products.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-xl font-semibold">Вы молодец!</p>
          <p>Вы скупили все товары, которые были в наличии!</p>
          <p className="text-sm mt-4">
            Не переживайте, скоро новые товары прибудут!
          </p>
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
