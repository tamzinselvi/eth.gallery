import * as Sequelize from "sequelize"

import { sequelize } from "../services/sequelize"

export const Account = sequelize.define('account', {
  id: { type: Sequelize.STRING, primaryKey: true },
  email: { type: Sequelize.STRING,  unique: 'compositeIndex' },
  nickname: { type: Sequelize.STRING },
  nicknameOccurrence: { type: Sequelize.INTEGER },
}, {
  indexes: [
    {
      fields: ["nickname"],
    },
  ],
})
