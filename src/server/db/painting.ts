import * as Sequelize from "sequelize"

import { sequelize } from "../services/sequelize"

export const Painting = sequelize.define("painting", {
  name: { type: Sequelize.STRING },
  nameOccurrence: { type: Sequelize.INTEGER },
  owner: { type: Sequelize.STRING },
  paintingHash: { type: Sequelize.STRING, unique: "compositeIndex" },
  transactionHash: { type: Sequelize.STRING, unique: "compositeIndex" },
  size: { type: Sequelize.BIGINT },
  url: { type: Sequelize.STRING },
}, {
  indexes: [
    {
      fields: ["name", "owner"],
    },
  ],
})
