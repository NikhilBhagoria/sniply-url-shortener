export default function Message({ emoji, title, text }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-4xl mb-3">{emoji}</div>
        <h1 className="text-xl font-bold mb-1">{title}</h1>
        <p className="text-slate-500">{text}</p>
      </div>
    </div>
  );
}
