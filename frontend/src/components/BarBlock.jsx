import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Generic horizontal breakdown (devices / browsers / referrers)
export default function BarBlock({ title, data }) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(120, data.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis 
              type="category" 
              dataKey="label" 
              width={90} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'currentColor', fontSize: '10px' }}
              className="text-slate-550 dark:text-slate-400"
            />
            <Tooltip 
              cursor={{ fill: 'currentColor' }} 
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
              className="dark:block hidden"
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }} 
              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }}
              itemStyle={{ color: '#0f172a' }}
              className="dark:hidden block"
            />
            <Bar dataKey="count" fill="#1e75ff" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
