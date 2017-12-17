var EthGallery = artifacts.require("EthGallery");
var fs = require("fs");

const configPath = __dirname + "/../../../config.json";

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(EthGallery).then(() => {
    let config = {};

    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath));
    }

    config.address = EthGallery.address;

    fs.writeFileSync(configPath, JSON.stringify(config, false, '  '));
  });
};
