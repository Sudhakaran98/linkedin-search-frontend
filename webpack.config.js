const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
      // Proxy all /api requests to the backend running on port 8080
      proxy: [
        {
          context: ['/api'],
          target: process.env.API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      ],
    },
    devtool: isDev ? 'eval-source-map' : 'source-map',
  };
};
