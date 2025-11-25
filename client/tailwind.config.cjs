/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(236, 72, 153, 0.5), 0 0 10px rgba(236, 72, 153, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(236, 72, 153, 0.8), 0 0 20px rgba(236, 72, 153, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};

