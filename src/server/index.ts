import * as express from "express"
import * as path from "path"
import * as session from "express-session"
import * as CookieParser from "cookie-parser"
import { PNG } from "pngjs"
import * as tmp from "tmp"
import * as fs from "fs"
import BigNumber from "bignumber.js"
import * as nodeFLIF from "node-flif"

import { registerAccountListeners, registerPaintingListeners } from "./socket"

import { app, events, http, sequelize, io, web3, paintingService } from "./services"

const contentDir = path.resolve(`${__dirname}/../../content`)

if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir)
}

events.on("NewPainting", (log) => {
  let size = parseInt(log.args.size.toString())

  paintingService.get(log.args.id.toString(16))
    .then((painting) => {
      if (painting) {
        return
      }

      web3.eth.getTransaction(log.transactionHash, (err, transaction) => {
        if (err) {
          return console.error(err)
        }

        const gas = new BigNumber(transaction.gas)
        const gasPrice = new BigNumber(transaction.gasPrice)
        const price = gas.mul(gasPrice).plus(transaction.value)

        const buffer = new Buffer(log.args.image.map((h, i) => {
          let trim = h.substr(2)

          if (i === (log.args.image.length - 1)) {
            trim = trim.substr(64 - ((size % 32) * 2))
          }

          return (trim.match(/.{1,2}/g) || []).map(h => parseInt(h, 16))
        }).reduce((a, b) => a.concat(b), []))

        tmp.tmpName({ template: path.resolve(__dirname + '/../../content/tmp-XXXXXX.flif') }, (err, flifPath) => {
          console.error(err, buffer)
          fs.writeFile(flifPath, buffer, (err) => {
            console.error(err)
            tmp.tmpName({ template: path.resolve(__dirname + '/../../content/tmp-XXXXXX.png') }, (err, decodePath) => {
              console.error(err)
              nodeFLIF.decode({
                input: flifPath,
                output: decodePath,
              }, () => {
                paintingService.create(
                  log.args.name,
                  log.args.description,
                  log.args.owner,
                  log.args.id.toString(16),
                  log.transactionHash,
                  log.blockNumber,
                  log.transactionIndex,
                  new BigNumber(log.args.size),
                  price,
                  "content/" + path.basename(decodePath),
                )
              })
            })
          })
        })
      })
    })
})

events.on("PurchasedAuction", (log) => {
  paintingService.get(log.args.id.toString(16))
    .then((painting) => {
      painting.auctionStartingBlock = 0
      painting.auctionEndingBlock = 0
      painting.auctionStartingPrice = 0
      painting.auctionEndingPrice = 0
      painting.ownerId = log.args.purchaser
      painting.price = new BigNumber(log.args.price).toString()
      console.log("PRICE PRICE", log.args.price)

      painting.save()
    })
})

events.on("NewAuction", (log) => {
  paintingService.get(log.args.id.toString(16))
    .then((painting) => {
      const startingBlockNumber = new BigNumber(log.blockNumber)
      const endingBlockNumber = startingBlockNumber.add(new BigNumber(log.args.duration))

      painting.auctionStartingBlock = startingBlockNumber.toPrecision()
      painting.auctionEndingBlock = endingBlockNumber.toPrecision()
      painting.auctionStartingPrice = log.args.startingPrice.toPrecision()
      painting.auctionEndingPrice = log.args.endingPrice.toPrecision()

      painting.save()
    })
})

const cookieParser = CookieParser()

const sessionMiddleware = session({ secret: "pleaseexcusemydearunclewally", cookie: { maxAge: 60000 }, resave: true })

io.use((socket, next) => {
  const req = socket.request
  const res = req.res

  cookieParser(req, res, (err) => {
    if (err) return next(err)

    sessionMiddleware(req, res, next)
  })
})

app.use(cookieParser)
app.use(sessionMiddleware)

express.static.mime.types.wasm = "application/wasm"

if (process.env.NODE_ENV === "production") {
  app.use("/bundle", express.static(path.join(__dirname, "../../bundle")))
} else {
  /* tslint:disable no-var-requires */
  const webpackConfig = require("../../webpack.config")
  const webpack = require("webpack")
  const middleware = require("webpack-dev-middleware")
  const compiler = webpack(webpackConfig)
  /* tslint:enable no-var-requires */

  app.use(middleware(compiler, { publicPath: "/bundle" }))
  app.use("/bundle", express.static(path.join(__dirname, "../../node_modules/libflif.js/lib")))
}
app.use("/content", express.static(path.join(__dirname, "../../content")))

app.use("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")))

io.on("connection", (socket) => {
  console.log("a user has connected")

  registerAccountListeners(socket)
  registerPaintingListeners(socket)
})

sequelize.sync()
  .then(() => http.listen(process.env.PORT || 8080, () => console.log(`eth.gallery service has started on port ${process.env.PORT || 8080}`)))
