import { Account, Painting, PaintingVote } from "../db"
import { web3 } from "./web3"
import BigNumber from "bignumber.js"
import * as sequelize from "sequelize"
import * as _ from "lodash"

class PaintingService {
  create(
    name: string,
    description: string,
    owner: string,
    id: string,
    transactionHash: string,
    blockNumber: number,
    transactionIndex: number,
    size: BigNumber,
    price: BigNumber,
    url: string,
  ): Promise<any> {
    return Painting.count({ where: { name } })
      .then((count) =>
        Painting.create({ id, name, description, nameOccurrence: (count + 1), creatorId: owner, ownerId: owner, transactionHash, blockNumber, transactionIndex, size: size.toString(), price: price.toString(), url })
      )
  }

  get(id: string, voterId = null): Promise<any> {
    return Painting.findById(
      id,
      {
        include: [
          {
            model: Account,
            as: "creator",
          },
          {
            model: Account,
            as: "owner",
          },
          {
            model: PaintingVote,
            separate: true,
            where: {
              voterId,
            },
          },
        ]
      },
    )
  }

  vote(voterId: string, paintingId: string, positive: boolean): Promise<any> {
    positive = !!positive

    return Painting.findOne({ where: { id: paintingId } })
      .then((painting) => {
        if (!painting) {
          return
        }

        return PaintingVote.findOne({ where: { voterId, paintingId } })
          .then(paintingVote => {
            if (paintingVote) {
              if (paintingVote.positive === positive) {
                return true
              }

              paintingVote.positive = positive

              return paintingVote.save()
                .then(() => {
                  if (positive) {
                    return Painting.increment("rating", { by: 2, where: { id: paintingId } })
                      .then(() => true)
                  }

                  return Painting.increment("rating", { by: -2, where: { id: paintingId } })
                    .then(() => true)
                })
            }

            return PaintingVote.create({ voterId, paintingId, positive })
              .then(() => {
                if (positive) {
                  return Painting.increment("rating", { where: { id: paintingId } })
                    .then(() => true)
                }

                return Painting.increment("rating", { by: -1, where: { id: paintingId } })
                  .then(() => true)
              })
          })
      })
  }

  list(
    page: number,
    pageSize: number,
    search: string = null,
    sort = null,
    voterId = null,
    ownerId = null,
  ): Promise<any> {
    if (sort === null) {
      sort = {
        popularity: "DESC",
      }
    }
    else if (!sort.age && !sort.name && !sort.price && !sort.auctionPrice && !sort.popularity) {
      sort.popularity = "DESC"
    }
    const query = {
      offset: Math.max(0, (page - 1)) * Math.max(4, Math.min(pageSize - (pageSize % 4), 48)),
      order: [],
      where: {},
      limit: pageSize,
      include: [
        {
          model: Account,
          as: "creator",
        },
        {
          model: Account,
          as: "owner",
        },
        {
          model: PaintingVote,
          separate: true,
          where: {
            voterId,
          },
        },
      ],
    }

    if (ownerId) {
      query.where["ownerId"] = ownerId 
    }

    if (search) {
      query["where"]["$or"] = [
        { 'name': { $iLike: '%' + search + '%' } },
        { '$creator.nickname$': { $iLike: '%' + search + '%' } },
      ]
    }

    if (sort.auctionPrice) {
      const blockNumber = web3.eth.blockNumber

      query["where"]["auctionStartingBlock"] = { "$lte": blockNumber }
      query["where"]["auctionEndingBlock"] = { "$gte": blockNumber }
    }

    if (sort.popularity) {
      query.order.push(["rating", sort.popularity])
    }

    if (sort.age) {
      query.order.push(["createdAt", sort.age])
    }

    if (sort.name) {
      query.order.push([sequelize.fn('lower', sequelize.col('name')), sort.name])
    }

    if (sort.price) {
      query.order.push(["price", sort.price])
    }

    return Painting.findAndCountAll(query)
  }
}

export const paintingService = new PaintingService()
