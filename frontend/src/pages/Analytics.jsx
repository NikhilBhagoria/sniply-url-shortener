import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Workspace / Analytics</span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Analytics</h1>
        <p className="text-slate-500 text-xs mt-0.5">View performance metrics, traffic trends, and link activity.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e75ff]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-3">12.4K</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Clicks</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-3">Google</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Top Referrer</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-3">6.8%</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Conversion Rate</p>
          </div>
        </div>
      </div>

      {/* Traffic details card placeholder */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Traffic Source Breakdown</h3>
        <p className="text-slate-500 text-xs mt-0.5">Understand where your audience is coming from.</p>
        <div className="mt-6 h-48 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
          Interactive charts will render here.
        </div>
      </div>
    </div>
  );
}
