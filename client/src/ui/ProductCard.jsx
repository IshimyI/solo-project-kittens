/* eslint-disable react/prop-types */

export default function ProductCard({ product, buyItem }) {
  return (
    <div className="bg-white shadow-lg hover:shadow-2xl rounded-2xl p-4 flex flex-col items-center border border-transparent hover:border-kitt-primary/30 hover:-translate-y-1 transition-all duration-300">
      <h4 className="bg-kitt-primary text-white text-sm font-medium px-5 py-1.5 rounded-full shadow">
        {product.TypeOfCloth.name}
      </h4>
      <div className="relative overflow-hidden flex items-center justify-center">
        {/* Полупрозрачный силуэт кота позади — размер карточки по-прежнему
            задаёт сама картинка товара (как раньше), силуэт лишь
            подложен и обрезается по её границам, если не помещается. */}
        <img
          src="/imgs/coat1.png"
          alt=""
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none"
        />
        <img
          src={`/imgs/${product.path}.png`}
          alt={product.name}
          className="relative"
        />
      </div>
      <h3 className="text-lg font-semibold mt-2 text-kitt-txt text-center">
        {product.name}
      </h3>
      <p className="flex items-center justify-center gap-1.5 text-kitt-secondary font-semibold mt-1">
        <img src="/coin-icon.png" alt="" className="w-4 h-4" />
        {product.price}
      </p>
      <button
        onClick={() => buyItem(product)}
        className="mt-3 bg-kitt-primary text-white px-5 py-2 rounded-full shadow hover:bg-kitt-secondary hover:scale-105 active:scale-95 transition-all duration-200"
      >
        Купить
      </button>
    </div>
  );
}
