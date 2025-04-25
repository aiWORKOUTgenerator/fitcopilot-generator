const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      frontend: './src/index.tsx',
      'api-tracker': './src/features/api-tracker/index.tsx',
      'token-usage': './src/features/token-usage/index.tsx',
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
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                    require('postcss-nested'),
                    ...(isProduction ? [require('cssnano')] : []),
                  ],
                },
              },
            },
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
  };
}; 