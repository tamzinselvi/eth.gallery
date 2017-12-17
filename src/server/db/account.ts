import * as Sequelize from "sequelize"

import { sequelize } from "../services/sequelize"

export const Account = sequelize.define('account', {
  address: { type: Sequelize.STRING,  unique: 'compositeIndex' },
  email: { type: Sequelize.STRING,  unique: 'compositeIndex' },
  nickname: { type: Sequelize.STRING,  unique: 'compositeIndex' },
})
