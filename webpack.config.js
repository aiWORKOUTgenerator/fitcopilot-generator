const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      frontend: './src/index.tsx',
      'api-tracker': './src/features/api-tracker/index.tsx',
      'token-usage': './src/features/token-usage/index.tsx',
      'profile': './src/features/profile/index.tsx',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js',
      clean: true,
    },
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@common': path.resolve(__dirname, 'src/common'),
        '@features': path.resolve(__dirname, 'src/features'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(css|scss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
      }),
    ],
    optimization: {
      minimize: isProduction,
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            test: /[\\/]src[\\/]common[\\/]/,
            name: 'common',
            chunks: 'all',
          },
        },
      },
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 1024 * 1000, // 1MB
      maxAssetSize: 1024 * 500, // 500KB
    },
  };
}; 