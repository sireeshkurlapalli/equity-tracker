'use client';

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)] p-4 ${hover ? 'hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-light)] transition-all duration-200 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'default';
  className?: string;
}) {
  const styles: Record<string, string> = {
    green: 'bg-[var(--green-dim)] text-[var(--green)] border-[var(--green)]',
    red: 'bg-[var(--red-dim)] text-[var(--red)] border-[var(--red)]',
    blue: 'bg-[var(--blue-dim)] text-[var(--blue)] border-[var(--blue)]',
    amber: 'bg-[rgba(245,158,11,0.12)] text-[var(--amber)] border-[var(--amber)]',
    purple: 'bg-[rgba(139,92,246,0.12)] text-[var(--purple)] border-[var(--purple)]',
    default: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const base = 'rounded-lg font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const variants = {
    primary: 'bg-[var(--blue)] text-white hover:opacity-90 active:scale-[0.98]',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-light)]',
    danger: 'bg-[var(--red-dim)] text-[var(--red)] border border-[var(--red)] hover:opacity-90',
    ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled,
  className = '',
}: {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-colors ${error ? 'border-[var(--red)]' : ''}`}
      />
      {error && <span className="text-xs text-[var(--red)]">{error}</span>}
    </div>
  );
}

export function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  suffix,
  disabled,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  error?: string;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>}
      <div className="relative">
        <input
          type="number"
          value={value === 0 ? '' : value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-colors pr-10"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">{suffix}</span>}
      </div>
      {error && <span className="text-xs text-[var(--red)]">{error}</span>}
    </div>
  );
}
