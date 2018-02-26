var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './test/demo.tsx',
  //entry: path.resolve(__dirname, './node_modules/orb-fork/src/js/orb'),
  output: {
    path: 'dist',
    filename: 'index_bundle.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', 'json', '.ts', '.tsx']
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.json$/, loader: 'json-loader'},
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'node_modules/orb-fork/src'),
        ],
        loader: 'babel-loader',
        query: {
          presets: [
            'env',
            'es2015',
            'react'
          ]
        }
      },
      /*
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
      //*/
      { test: /\.ts(x?)/, loader: 'ts-loader' },
    ]
  },
  plugins: [new HtmlWebpackPlugin()]
};
