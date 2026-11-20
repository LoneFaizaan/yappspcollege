/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#fbfbfb',
          dark: '#0f1115',
        },
        surface: {
          light: '#ffffff',
          dark: '#16181d',
          subtle: {
            light: '#f4f5f7',
            dark: '#1c1f26',
          }
        },
        border: {
          light: '#e5e7eb',
          dark: '#272a34',
          subtle: {
            light: '#f0f2f5',
            dark: '#1f222b',
          }
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          muted: '#eff6ff',
          darkMuted: '#1e293b',
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
