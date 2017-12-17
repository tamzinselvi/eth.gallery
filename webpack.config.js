var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'inline-source-map',
  entry: './src/client/index.ts',
  output: {
    filename: 'app.js',
    path: __dirname + '/build/bundle'
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      },
      {
        test: /\.(css)$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.sass$/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.(svg|png|eot|ttf|woff|woff2|wasm)$/,
        loader: 'file-loader',
        options: {
          publicPath: "/bundle/"
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
