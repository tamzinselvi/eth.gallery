var EthGallery = artifacts.require("EthGallery");
var fs = require("fs");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(EthGallery, { from: "0x391357ad95a037ee570ef392acdf7f2266d5d078" }).then(() => {
    fs.writeFileSync(__dirname + "/../../client/contracts/address.json", JSON.stringify(EthGallery.address));
  });
};
