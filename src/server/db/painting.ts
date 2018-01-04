import * as Sequelize from "sequelize"

import { PaintingVote } from "./painting-vote"
import { Account } from "./account"

import { sequelize } from "../services/sequelize"

export const Painting = sequelize.define("painting", {
  id: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING },
  description: { type: Sequelize.STRING },
  nameOccurrence: { type: Sequelize.INTEGER },
  transactionHash: { type: Sequelize.STRING, unique: "compositeIndex" },
  blockNumber: { type: Sequelize.INTEGER },
  transactionIndex: { type: Sequelize.INTEGER },
  rating: { type: Sequelize.INTEGER, defaultValue: 0 },
  size: { type: Sequelize.DECIMAL },
  price: { type: Sequelize.DECIMAL },
  auctionStartingBlock: { type: Sequelize.DECIMAL, defaultValue: 0 },
  auctionEndingBlock: { type: Sequelize.DECIMAL, defaultValue: 0 },
  auctionStartingPrice: { type: Sequelize.DECIMAL, defaultValue: 0 },
  auctionEndingPrice: { type: Sequelize.DECIMAL, defaultValue: 0 },
  url: { type: Sequelize.STRING },
}, {
  indexes: [
    {
      fields: [
        "auctionStartingBlock",
        "auctionEndingBlock",
      ],
    },
  ],
})

Painting.hasMany(PaintingVote, { constraints: false, foreignKey: 'paintingId', sourceKey: 'id' })
Painting.belongsTo(Account, { constraints: false, as: "creator", foreignKey: 'creatorId', sourceKey: 'id' })
Painting.belongsTo(Account, { constraints: false, as: "owner", foreignKey: 'ownerId', sourceKey: 'id' })
