import * as EventEmitter from "events"
import * as Web3 from "web3"

import * as EthGallery from "../../contract/build/contracts/Gallery.json"
import * as config from "../../../config.json"

const ethGalleryAddress = config["address"]

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

const EthGalleryContract = web3.eth.contract(EthGallery["abi"])
const ethGallery = EthGalleryContract.at(ethGalleryAddress)

const ethEvents = ethGallery.allEvents({ fromBlock: 0, toBlock: 'latest' })

const events = new EventEmitter()

ethEvents.watch((err, log) => {
  console.log(err, log)

  if (err) {
    events.emit("error", err)
    return
  }

  events.emit(log.event, log)
})

export { web3, ethGallery, events }
