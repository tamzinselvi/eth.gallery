import * as EthGallery from "../../contract/build/contracts/EthGallery.json"
import * as config from "../../../config.json"
import * as Web3 from "web3"
import * as abiDecoder from "abi-decoder"

window["abiDecoder"] = abiDecoder
abiDecoder.addABI(EthGallery["abi"])

import { Injectable } from '@angular/core';

@Injectable()
export class Web3Service {
  public web3
  public ethGallery

  load(): Promise<any> {
    return new Promise((resolve, reject) => {
      const ethGalleryAddress = config["address"]

      if (typeof window["web3"] !== "undefined") {
        window["web3"] = new Web3(window["web3"].currentProvider)

        this.web3 = window["web3"]

        if (!this.web3.eth.defaultAccount) {
          this.web3.eth.defaultAccount = this.web3.eth.accounts[0]
        }

        const EthGalleryContract = window["web3"].eth.contract(EthGallery["abi"])
        const ethGallery = this.ethGallery = window["ethGallery"] = EthGalleryContract.at(ethGalleryAddress)

        const ethEvents = ethGallery.allEvents({ fromBlock: 0, toBlock: 'latest' })
      }

      resolve()
    })
  }

  hasMetaMask(): boolean {
    return !!this.web3;
  }

  signMessage(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.web3.personal.sign(this.web3.fromAscii(message), this.getAddress(), (err, sig) => {
        if (err) {
          return reject(err)
        }

        resolve(sig)
      })
    })
  }

  getAddress(): string {
    return this.web3.eth.accounts[0]
  }
}
