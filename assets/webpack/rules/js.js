module.exports = {
  test    : /\.(js)$/,
  exclude : /(node_modules|build|dist\/)/,
  use     : [{
    loader: 'babel-loader',
    options: {
      "presets": [
        ["env", {
          "targets": {
            "browsers": ["last 2 versions", "> 2%"]
          }
        }]
      ],
      "plugins": ["syntax-dynamic-import"]
    }
  }],
};
