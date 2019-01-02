module.exports = {
  test: /\.(eot|svg|ttf|woff|woff2)$/,
  //  exclude: /(node_modules)/,
  use: {
    loader: 'url-loader?limit=100000',
    options: {
      outputPath: 'fonts'
    }
  }
}
