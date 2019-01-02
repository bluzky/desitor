const manifest = require("../manifest");

const plugins = [];

plugins.push(
  ...require("./internal"),
  require("./extractPlugin")
);

if (manifest.IS_PRODUCTION) {
  plugins.push(require("./imageminPlugin"));
}

plugins.push(require("./copyPlugin"));

module.exports = plugins;
