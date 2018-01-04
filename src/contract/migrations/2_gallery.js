var Gallery = artifacts.require("Gallery");
var fs = require("fs");

const configPath = __dirname + "/../../../config.json";

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(Gallery).then(() => {
    let config = {};

    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath));
    }

    config.address = Gallery.address;

    fs.writeFileSync(configPath, JSON.stringify(config, false, '  '));
  });
};
