import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const colors = ['#1e75ff', '#10b981', '#8b5cf6', '#f59e0b', '#64748b'];
export default function BrowserChart({ data }) {
  if (!data.length) return <p className="text-xs text-slate-400">No browser data in this date range.</p>;
  // Keep the visual readable without dropping long-tail browser counts.
  const values = data.length > 5 ? [...data.slice(0, 4), {
    label: 'Others', count: data.slice(4).reduce((sum, x) => sum + x.count, 0),
    percentage: Math.round(data.slice(4).reduce((sum, x) => sum + x.count, 0) / data.reduce((sum, x) => sum + x.count, 0) * 1000) / 10,
  }] : data;
  return <div>
    <ResponsiveContainer width="100%" height={180}>
      <PieChart><Pie data={values} dataKey="count" nameKey="label" innerRadius={48} outerRadius={72} isAnimationActive={false}>
        {values.map((x, i) => <Cell key={x.label} fill={colors[i]} />)}
      </Pie><Tooltip /></PieChart>
    </ResponsiveContainer>
    <ul className="space-y-2 text-xs">{values.map((x, i) => <li key={x.label} className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />{x.label}</span>
      <span>{x.count} clicks · {x.percentage}%</span>
    </li>)}</ul>
  </div>;
}
