import { paintingService, web3 } from "../services"
import * as _ from "lodash"
import BigNumber from "bignumber.js"

export const registerPaintingListeners = (socket) => {
  socket.on("painting:list", (params) => {
    let blockNumber = new BigNumber(web3.eth.blockNumber)
    paintingService.list(params.page, params.pageSize, params.search, params.sort, socket.request.session.account)
      .then(({ count, rows }) => ({
        count,
        rows: rows.map((painting) => {
          const auctionStartingBlock = new BigNumber(painting.auctionStartingBlock)
          const auctionEndingBlock = new BigNumber(painting.auctionEndingBlock)
          const auctionStartingPrice = new BigNumber(painting.auctionStartingPrice)
          const auctionEndingPrice = new BigNumber(painting.auctionEndingPrice)

          let vote = _.first(painting.painting_votes)
          let auctionPrice

          if (auctionStartingBlock.lte(blockNumber) && auctionEndingBlock.gte(blockNumber)) {
            let duration = auctionEndingBlock.sub(auctionStartingBlock)
            let position = blockNumber.sub(auctionStartingBlock)
            auctionPrice = auctionStartingPrice.minus(auctionStartingPrice.sub(auctionEndingPrice).mul(position.div(duration)))
          }

          return {
            id: painting.id,
            name: painting.name,
            nameOccurrence: painting.nameOccurrence,
            price: painting.price,
            auctionPrice,
            url: painting.url,
            owner: (!painting.owner ? null : {
              id: painting.owner.id,
              nickname: painting.owner.nickname,
              nicknameOccurrence: painting.owner.nicknameOccurrence,
            }),
            creator: (!painting.creator ? null : {
              id: painting.creator.id,
              nickname: painting.creator.nickname,
              nicknameOccurrence: painting.creator.nicknameOccurrence,
            }),
            vote: (vote ? vote.positive : null),
          }
        }),
      }))
      .then(paintings => {
        socket.emit("painting:list", paintings)
      })
  })

  socket.on("painting:get", (params) => {
    let blockNumber = new BigNumber(web3.eth.blockNumber)
    paintingService.get(params.id, socket.request.session.account)
      .then((painting) => {
        const auctionStartingBlock = new BigNumber(painting.auctionStartingBlock)
        const auctionEndingBlock = new BigNumber(painting.auctionEndingBlock)
        const auctionStartingPrice = new BigNumber(painting.auctionStartingPrice)
        const auctionEndingPrice = new BigNumber(painting.auctionEndingPrice)

        let vote = _.first(painting.painting_votes)
        let auctionPrice

        if (auctionStartingBlock.lte(blockNumber) && auctionEndingBlock.gte(blockNumber)) {
          let duration = auctionEndingBlock.sub(auctionStartingBlock)
          let position = blockNumber.sub(auctionStartingBlock)
          auctionPrice = auctionStartingPrice.minus(auctionStartingPrice.sub(auctionEndingPrice).mul(position.div(duration)))
        }

        return {
          id: painting.id,
          name: painting.name,
          description: painting.description,
          nameOccurrence: painting.nameOccurrence,
          price: painting.price,
          auctionPrice,
          url: painting.url,
          owner: (!painting.owner ? null : {
            id: painting.owner.id,
            nickname: painting.owner.nickname,
            nicknameOccurrence: painting.owner.nicknameOccurrence,
          }),
          creator: (!painting.creator ? null : {
            id: painting.creator.id,
            nickname: painting.creator.nickname,
            nicknameOccurrence: painting.creator.nicknameOccurrence,
          }),
          vote: (vote ? vote.positive : null),
        }
      })
      .then(painting => socket.emit("painting:get", painting))
  })

  socket.on("painting:vote", (params) => {
    console.log(params, socket.request.session.account)
    if (socket.request.session.account) {
      return paintingService.vote(socket.request.session.account, params.paintingId, params.positive)
        .then(vote => socket.emit("painting:vote", vote))
    }
  })
}
