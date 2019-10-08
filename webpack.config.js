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
  },
}
