import type { Config } from 'tailwindcss';

const calendarColors = [
  // Background colors for event types
  'bg-blue-50', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-950',
  'bg-green-50', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-950',
  'bg-purple-50', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-950',
  'bg-orange-50', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-950',
  'bg-red-50', 'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-950',
  'bg-yellow-50', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-950',
  'bg-pink-50', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-950',
  'bg-teal-50', 'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-teal-700', 'bg-teal-950',

  // Border colors
  'border-blue-200', 'border-blue-800', 'border-green-200', 'border-green-800',
  'border-purple-200', 'border-purple-800', 'border-orange-200', 'border-orange-800',
  'border-red-200', 'border-red-800', 'border-yellow-200', 'border-yellow-800',
  'border-pink-200', 'border-pink-800', 'border-teal-200', 'border-teal-800',

  // Text colors
  'text-blue-300', 'text-blue-700', 'text-green-300', 'text-green-700',
  'text-purple-300', 'text-purple-700', 'text-orange-300', 'text-orange-700',
  'text-red-300', 'text-red-700', 'text-yellow-300', 'text-yellow-700',
  'text-pink-300', 'text-pink-700', 'text-teal-300', 'text-teal-700',

  // Hover states
  'hover:bg-blue-400', 'hover:bg-blue-700', 'hover:bg-green-400', 'hover:bg-green-700',
  'hover:bg-purple-400', 'hover:bg-purple-700', 'hover:bg-orange-400', 'hover:bg-orange-700',
  'hover:bg-red-400', 'hover:bg-red-700', 'hover:bg-yellow-400', 'hover:bg-yellow-700',
  'hover:bg-pink-400', 'hover:bg-pink-700', 'hover:bg-teal-400', 'hover:bg-teal-700',

  // Dark mode variants
  'dark:bg-blue-500', 'dark:bg-blue-950', 'dark:bg-green-500', 'dark:bg-green-950',
  'dark:bg-purple-500', 'dark:bg-purple-950', 'dark:bg-orange-500', 'dark:bg-orange-950',
  'dark:bg-red-500', 'dark:bg-red-950', 'dark:bg-yellow-500', 'dark:bg-yellow-950',
  'dark:bg-pink-500', 'dark:bg-pink-950', 'dark:bg-teal-500', 'dark:bg-teal-950',
  'dark:border-blue-800', 'dark:border-green-800', 'dark:border-purple-800', 'dark:border-orange-800',
  'dark:border-red-800', 'dark:border-yellow-800', 'dark:border-pink-800', 'dark:border-teal-800',
  'dark:text-blue-300', 'dark:text-green-300', 'dark:text-purple-300', 'dark:text-orange-300',
  'dark:text-red-300', 'dark:text-yellow-300', 'dark:text-pink-300', 'dark:text-teal-300',
  'dark:hover:bg-blue-400', 'dark:hover:bg-green-400', 'dark:hover:bg-purple-400', 'dark:hover:bg-orange-400',
  'dark:hover:bg-red-400', 'dark:hover:bg-yellow-400', 'dark:hover:bg-pink-400', 'dark:hover:bg-teal-400',
];

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  safelist: [
    ...calendarColors,
    // Add any other classes that should never be purged
    'text-xs',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
  ],
  plugins: [
    // Only include tailwindcss-animate if it exists
    ...((() => {
      try {
        return [require('tailwindcss-animate')];
      } catch {
        return [];
      }
    })()),
  ],
};

export default config;
