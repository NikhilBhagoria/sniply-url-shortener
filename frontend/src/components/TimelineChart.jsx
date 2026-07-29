import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TimelineChart({ data }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="font-semibold mb-3">Clicks over time</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400">No clicks yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
