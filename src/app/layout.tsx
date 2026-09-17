import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EquityPulse — Portfolio Tracker',
  description: 'Track your equity portfolio with live NSE prices, P/L analysis, and AI-powered recommendations.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%233b82f6'/><path d='M8 22V12l8-4 8 4v10l-8 4-8-4z' fill='white'/></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
