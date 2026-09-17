'use client';

export function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const tabs = [
    { id: 'dashboard', label: 'Portfolio', icon: '📊' },
    { id: 'add', label: 'Add Scrip', icon: '➕' },
    { id: 'recommendations', label: 'Analytics', icon: '📈' },
  ];

  return (
    <nav className="flex flex-col gap-1.5 w-56 shrink-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            activeTab === tab.id
              ? 'bg-[var(--blue-dim)] text-[var(--blue)] border-l-2 border-[var(--blue)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="text-base">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
      <div className="mt-auto pt-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-muted)] px-4 leading-relaxed">
          EquityPulse tracks your equity portfolio with live NSE prices. P/L shown at 60% adjusted for realistic risk modelling.
        </p>
      </div>
    </nav>
  );
}

export function Header() {
  return (
    <header className="flex items-center justify-between mb-6 px-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-gradient">EquityPulse</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time NSE portfolio tracker</p>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="hidden sm:flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--green)] animate-pulse-soft" />
          <span>NSE Live</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>
    </header>
  );
}
