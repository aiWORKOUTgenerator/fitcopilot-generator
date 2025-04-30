module.exports = {
  stories: [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-measure',
    '@storybook/addon-outline'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  features: {
    postcss: false
  },
  webpackFinal: async (config) => {
    // Add SCSS support
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            additionalData: `
              @import "../src/styles/design-system/tokens/core/colors";
              @import "../src/features/workout-generator/styles/_variables.scss";
              @import "../src/features/workout-generator/styles/_color-tokens.scss";
            `
          }
        }
      ]
    });

    return config;
  },
  docs: {
    autodocs: true
  }
}; 