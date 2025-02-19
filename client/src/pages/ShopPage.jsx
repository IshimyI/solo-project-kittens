import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";
import axiosInstance from "../axiosInstance";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/shop");
        setProducts(res.data);
      } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <>
      <h1 className="text-3xl font-bold underline">Магазин путешественника</h1>
      <div className="card m-4 grid grid-cols-3 gap-16 px-12 py-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
