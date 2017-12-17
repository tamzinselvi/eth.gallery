import * as Sequelize from "sequelize"

let _sequelize

if (process.env.DB === "sqlite") {
  _sequelize = new Sequelize('sqlite:local.db')
}
else if (process.env.DB === "postgres") {
  _sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_URL)
}

export const sequelize = _sequelize
