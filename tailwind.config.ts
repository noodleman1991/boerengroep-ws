// import type { Config } from 'tailwindcss';
//
// const config: Config = {
//     content: [
//         './pages/**/*.{js,ts,jsx,tsx,mdx}',
//         './components/**/*.{js,ts,jsx,tsx,mdx}',
//         './app/**/*.{js,ts,jsx,tsx,mdx}',
//         './src/**/*.{js,ts,jsx,tsx,mdx}',
//     ],
//     theme: {
//         extend: {
//             colors: {
//                 border: 'hsl(var(--border))',
//                 input: 'hsl(var(--input))',
//                 ring: 'hsl(var(--ring))',
//                 background: 'hsl(var(--background))',
//                 foreground: 'hsl(var(--foreground))',
//                 primary: {
//                     DEFAULT: 'hsl(var(--primary))',
//                     foreground: 'hsl(var(--primary-foreground))',
//                 },
//                 secondary: {
//                     DEFAULT: 'hsl(var(--secondary))',
//                     foreground: 'hsl(var(--secondary-foreground))',
//                 },
//                 destructive: {
//                     DEFAULT: 'hsl(var(--destructive))',
//                     foreground: 'hsl(var(--destructive-foreground))',
//                 },
//                 muted: {
//                     DEFAULT: 'hsl(var(--muted))',
//                     foreground: 'hsl(var(--muted-foreground))',
//                 },
//                 accent: {
//                     DEFAULT: 'hsl(var(--accent))',
//                     foreground: 'hsl(var(--accent-foreground))',
//                 },
//                 popover: {
//                     DEFAULT: 'hsl(var(--popover))',
//                     foreground: 'hsl(var(--popover-foreground))',
//                 },
//                 card: {
//                     DEFAULT: 'hsl(var(--card))',
//                     foreground: 'hsl(var(--card-foreground))',
//                 },
//             },
//             borderRadius: {
//                 lg: 'var(--radius)',
//                 md: 'calc(var(--radius) - 2px)',
//                 sm: 'calc(var(--radius) - 4px)',
//             },
//             fontFamily: {
//                 sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
//                 mono: ['var(--font-mono)', 'Consolas', 'monospace'],
//             },
//         },
//     },
//     plugins: [],
// };
//
// export default config;
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
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
                // Boerengroep Brand Colors
                'brand': {
                    'tan': 'var(--color-brand-tan)',
                    'light-yellow': 'var(--color-brand-light-yellow)',
                    'green': 'var(--color-brand-green)',
                    'orange': 'var(--color-brand-orange)',
                    'lime': 'var(--color-brand-lime)',
                    'blue': 'var(--color-brand-blue)',
                    'light-green': 'var(--color-brand-light-green)',
                    'pale-yellow': 'var(--color-brand-pale-yellow)',
                    'primary-blue': 'var(--color-brand-primary-blue)',
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'Consolas', 'monospace'],
                heading: ['var(--font-enriqueta)', 'serif'],
                subtitle: ['var(--font-public-sans)', 'sans-serif'],
                body: ['var(--font-roboto-flex)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
