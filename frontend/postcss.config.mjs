const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      // This enables all modern CSS features and adds fallbacks
      features: {
        // Specifically telling it how to handle oklab/oklch colors
        'oklab-color-function': { 
          preserve: true // This keeps the oklch() for modern browsers
        }
      }
    },
  },
};

export default config;