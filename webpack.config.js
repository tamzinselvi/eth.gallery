const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const exec = require('child_process').exec

const devMode = process.env.NODE_ENV !== "production"

module.exports = {
  mode: devMode ? "development" : "production",
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  devtool: 'inline-source-map',
  entry: './src/client/index.ts',
  output: {
    filename: 'app.js',
    path: __dirname + '/bundle'
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
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.sass$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(svg|png|eot|ttf|woff|woff2|wasm)$/,
        loader: 'file-loader',
        options: {
          publicPath: "/bundle"
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    // new UglifyJsPlugin({
    //   test: /\.js($|\?)/i
    // })
    devMode ? {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          exec('say webpack');
        });
      }
    } : undefined
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
