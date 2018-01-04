import * as Sequelize from "sequelize"

import { sequelize } from "../services/sequelize"

export const PaintingVote = sequelize.define("painting_vote", {
  voterId: { type: Sequelize.STRING },
  paintingId: { type: Sequelize.STRING },
  positive: { type: Sequelize.BOOLEAN },
}, {
  indexes: [
    {
      fields: ["voterId", "paintingId"],
    },
  ],
})
