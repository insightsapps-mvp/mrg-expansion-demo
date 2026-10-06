/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        subtle: 'var(--bg-subtle)',
        card: 'var(--card)',
        line: 'var(--border)',
        'line-strong': 'var(--border-strong)',
        ink: 'var(--text)',
        ink2: 'var(--text-2)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        'accent-soft': 'var(--accent-soft)',
        brand: 'var(--brand)',
        'brand-fg': 'var(--brand-fg)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      borderRadius: { ctl: '10px', card: '14px', panel: '20px' },
      boxShadow: { sm: 'var(--shadow-sm)', md: 'var(--shadow-md)' },
      screens: { xs: '400px' },
    },
  },
  plugins: [],
};
