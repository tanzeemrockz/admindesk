import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Google Sans"', '"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      colors: {
        base: '#000000',
        canvas: '#000000',
        surface: '#0a0a0a',
        elevated: '#111111',
        'surface-elevated': '#161616',
        border: '#222222',
        'border-subtle': '#1a1a1a',
        'border-strong': '#333333',
        'border-active': '#444444',
        'border-focus': '#666666',
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669'
        },
        cyber: '#0070F3'
      }

    }
  },
  plugins: []
} satisfies Config;
