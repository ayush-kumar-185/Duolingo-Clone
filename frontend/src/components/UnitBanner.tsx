export function UnitBanner({ title, description, colorClass }: { title: string, description: string, colorClass: string }) {
  return (
    <div className={`w-full rounded-2xl p-6 text-white mb-8 flex flex-col gap-2 ${colorClass}`}>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="text-lg opacity-90">{description}</p>
    </div>
  );
}
