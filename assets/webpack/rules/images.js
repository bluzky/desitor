module.exports = {
  test: /\.(png|gif|jpg|svg)$/i,
  use: [
    {
      loader: 'url-loader?limit=20000',
      options: {
        outputPath: 'images'
      }
    }
  ]
}
