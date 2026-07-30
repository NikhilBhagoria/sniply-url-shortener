import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, User, Shield, BellRing, Eye, Globe2, Sparkles, Sliders } from 'lucide-react';

const menuItems = [
  { label: 'Profile', active: true, icon: User },
  { label: 'Security', icon: Shield },
  { label: 'Notifications', icon: BellRing },
  { label: 'Appearance', icon: Eye },
  { label: 'Custom Domains', icon: Globe2 },
];

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'alex@linkly.app');
  const [company, setCompany] = useState('Sniply');
  const [timezone, setTimezone] = useState('America/New_York');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');

  const handleSave = () => {
    alert('Changes saved successfully!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Workspace / Settings</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Settings</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage your profile, security, and workspace preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* 2. Grid Columns */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">

        {/* Left Column: Sub-menu Navigation */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm self-start space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveTab(item.label)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-xs font-semibold transition ${isActive
                    ? 'bg-[#1e75ff] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Column: Profile Panel */}
        <section className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">

            {/* Title / Subtitle */}
            <div>
              <h2 className="text-lg font-bold text-slate-900">{activeTab}</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {activeTab === 'Profile'
                  ? 'Update your personal information and workspace details.'
                  : `Configure your ${activeTab.toLowerCase()} options and preferences.`
                }
              </p>
            </div>

            {activeTab === 'Profile' ? (
              <div className="space-y-6">
                {/* Avatar Block */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                  />
                  <div className="text-center sm:text-left space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Avatar</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Upload a square image for your profile picture.</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      <button className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition">
                        Upload New
                      </button>
                      <button className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition"
                    >
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                    </select>
                  </div>

                  {/* Dark Mode toggle card */}
                  <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Dark mode preference</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Use a darker interface across the workspace.</p>
                      </div>

                      {/* Premium Toggle switch */}
                      <button
                        type="button"
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${darkMode ? 'bg-[#1e75ff]' : 'bg-slate-200'
                          }`}
                      >
                        <span className="sr-only">Toggle theme</span>
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-5 mt-4">
                  <button className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm transition"
                  >
                    Save Changes
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                This section is a mock setting page. Switch back to Profile to edit your credentials.
              </div>
            )}

          </div>

          {/* Workspace Settings panel at the bottom */}
          {activeTab === 'Profile' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workspace Settings</h3>
                <p className="text-slate-500 text-xs mt-0.5">Manage access, billing, and integrations.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 transition cursor-pointer">
                  <h4 className="text-xs font-bold text-slate-800">Billing</h4>
                  <p className="text-[11px] text-slate-400 mt-1">View your subscription and payment details.</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 transition cursor-pointer">
                  <h4 className="text-xs font-bold text-slate-800">Team</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Invite teammates and manage permissions.</p>
                </div>
              </div>
            </div>
          )}

        </section>

      </div>

    </div>
  );
}
