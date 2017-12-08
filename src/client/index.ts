import * as EthGallery from "./contracts/EthGallery.json";
import * as address from "./contracts/address.json";

window["address"] = address;

const Web3 = window["Web3"];

if (typeof window["web3"] !== 'undefined') {
  window["web3"] = new Web3(window["web3"].currentProvider);
} else {
  window["web3"] = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

const EthGalleryContract = window["web3"].eth.contract(EthGallery["abi"]);
window["ethGallery"] = EthGalleryContract.at(address);

export default {}
