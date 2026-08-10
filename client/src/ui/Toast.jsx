import React, { useEffect, useRef, useState } from "react";

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 shrink-0"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </svg>
);

const WarnIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 shrink-0"
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="7.5" x2="12" y2="13" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Каждый баннер сам управляет своим таймером и "уходом" — сначала плавно
// схлопывается (высота+прозрачность), и только потом реально исчезает из
// списка, поэтому следующие баннеры естественно и плавно подтягиваются
// вверх (это просто обычный поток flex-col, без ручной анимации сдвига).
function ToastItem({ toast, onDone }) {
  // Начинаем со свёрнутого состояния и на следующий кадр разворачиваем —
  // иначе CSS-transition не с чего анимировать при первом рендере, и
  // баннер просто мгновенно "спавнится" вместо плавного появления.
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const doneCalledRef = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => setLeaving(true), 3200);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!leaving) return undefined;
    const hideTimer = setTimeout(() => {
      if (!doneCalledRef.current) {
        doneCalledRef.current = true;
        onDone();
      }
    }, 300);
    return () => clearTimeout(hideTimer);
  }, [leaving, onDone]);

  const visible = entered && !leaving;

  return (
    <div
      className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
        visible ? "max-h-28 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
      }`}
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3 mt-2 rounded-xl shadow-2xl text-white font-semibold w-full ${
          toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}
      >
        {toast.type === "error" ? <WarnIcon /> : <CheckIcon />}
        <span className="text-sm sm:text-base">{toast.message}</span>
      </div>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 inset-x-0 flex flex-col items-center px-4 z-[200] pointer-events-none">
      <div className="w-full max-w-[92vw] sm:max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => onDismiss(t.id)} />
        ))}
      </div>
    </div>
  );
}
