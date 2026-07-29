import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Generic horizontal breakdown (devices / browsers / referrers)
export default function BarBlock({ title, data }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(120, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={90} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
