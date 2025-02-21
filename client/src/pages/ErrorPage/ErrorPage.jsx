export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-kitt-background text-kitt-txt">
      <div className="text-center p-6 rounded-lg shadow-lg bg-kitt-foreground max-w-lg mx-auto">
        <div className="mb-4"></div>
        <h1 className="text-4xl font-bold mb-4 text-white">
          Упс, похоже куда-то не туда завело путешествие
        </h1>
        <p className="text-xl text-kitt-secondary">
          Ничего страшного, скоро получится точно!
        </p>
        <button className="mt-6 px-6 py-2 text-white bg-kitt-primary rounded-lg hover:bg-kitt-secondary transition duration-300">
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
