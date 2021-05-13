'use strict';

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: {import: '/src/popup.ts', filename: '../dist/js/[name].js'},
    options: {import: '/src/options.ts', filename: '../dist/js/[name].js'},
    content: {import: '/src/content.ts', filename: '../dist/js/[name].js'},
    background: {import: '/src/background.ts', filename: '../dist/[name].js'},
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{from: '.', to: '../dist', context: 'public'}],
      options: {},
    }),
  ],
};
