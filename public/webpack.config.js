var HtmlWebpackPlugin = require("html-webpack-plugin");
var path = require("path");
//const webpack = require("webpack");

module.exports = {
  entry: "./test/demo.tsx",
  //entry: path.resolve(__dirname, './node_modules/orb-fork/src/js/orb'),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "pathway-finder.js"
  },
  //devtool: "cheap-module-eval-source-map",
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", "json"]
  },
  module: {
    loaders: [
      { test: /\.ts(x?)/, loader: "ts-loader" },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.json$/, loader: "json-loader" },
      /*
      {
        test: /\.jsx?$/,
        use: ["source-map-loader"],
        enforce: "pre"
      },
      //*/
      {
        test: /\.jsx?$/,
        include: [path.join(__dirname, "node_modules/orb-fork/src")],
        loader: "babel-loader",
        query: {
          presets: ["env", "es2015", "react"]
        }
      },
      {
        test: /\.styl$/,
        loader: "style-loader!css-loader!stylus-relative-loader"
      }
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
    ]
  },
  plugins: [new HtmlWebpackPlugin()]
};
