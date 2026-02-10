export default function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
