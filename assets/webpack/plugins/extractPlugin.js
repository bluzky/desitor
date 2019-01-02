const
  manifest          = require('../manifest'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = 
    new MiniCssExtractPlugin({
      filename: manifest.outputFiles.css,
      //filename: "[name].css",
      allChunks: true,
    });
