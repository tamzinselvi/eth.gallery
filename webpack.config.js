var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'inline-source-map',
  entry: './src/client/index.ts',
  output: {
    filename: 'app.js',
    path: __dirname + '/build/bundle'
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
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader?paths=node_modules/bootstrap-stylus/stylus/'
      },
      {
        test: /\.(svg|png|ttf)$/,
        loader: 'file-loader',
        options: {
          publicPath: __dirname + "/build/bundle"
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
