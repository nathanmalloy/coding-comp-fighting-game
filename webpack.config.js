const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ],
  },
  devServer: {
    hot: true,
    port: 9000,
    contentBase: './dist',
    writeToDisk: true,
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'sprites', to: 'sprites' },
      { from: 'index.html', to: 'index.html' },
      { from: 'index.css', to: 'index.css' }
    ])
  ]
}
