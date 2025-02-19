/* eslint-disable react/prop-types */

export default function ProductCard({ product }) {
  return (
    <div
      className={`bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center`}
    >
      <h4 className="bg-kitt-primary text-white font-medium px-5 py-2 rounded-3xl">
        {product.TypeOfCloth.name}
      </h4>
      <img src={`/imgs/${product.path}.png`} alt={product.name} />
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-500 mt-1">{product.price} ç</p>
      <button className="mt-3 bg-kitt-primary text-white px-4 py-2 rounded-lg hover:bg-kitt-secondary transition">
        Купить
      </button>
    </div>
  );
}
