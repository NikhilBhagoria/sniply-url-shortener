import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TimelineChart({ data }) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Clicks over time</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">No clicks yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'currentColor', fontSize: '10px' }}
              className="text-slate-550 dark:text-slate-455"
            />
            <YAxis 
              allowDecimals={false} 
              width={28} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'currentColor', fontSize: '10px' }}
              className="text-slate-550 dark:text-slate-455"
            />
            <Tooltip 
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
              className="dark:block hidden"
            />
            <Tooltip 
              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }}
              itemStyle={{ color: '#0f172a' }}
              className="dark:hidden block"
            />
            <Line type="monotone" dataKey="count" stroke="#1e75ff" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
