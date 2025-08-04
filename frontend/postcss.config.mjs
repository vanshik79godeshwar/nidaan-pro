const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      features: {
        // --- THIS IS THE FIX ---
        // Correcting the typo from "oklab-color-function" to "oklab-function"
        'oklab-function': { 
          preserve: true 
        }
      }
    },
  },
};

export default config;