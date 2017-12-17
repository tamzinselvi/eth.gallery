import * as express from "express"
import * as path from "path"
import * as session from "express-session"
import * as CookieParser from "cookie-parser"
import { PNG } from "pngjs"
import * as tmp from "tmp"
import * as nodeFLIF from "node-flif"
import * as fs from "fs"

import { registerAccountListeners, registerPaintingListeners } from "./socket"

import { app, events, http, sequelize, io, web3, paintingService } from "./services"

events.on("NewPainting", (log) => {
  console.log(log)
  let size = parseInt(log.args.size.toString())

  const buffer = new Buffer(log.args.image.map((h, i) => {
    let trim = h.substr(2)

    if (i === (log.args.image.length - 1)) {
      trim = trim.substr(64 - ((size % 32) * 2))
    }

    return trim.match(/.{1,2}/g).map(h => parseInt(h, 16))
  }).reduce((a, b) => a.concat(b), []))

  tmp.tmpName({ template: path.resolve(__dirname + '/../../build/tmp-XXXXXX.flif') }, (err, flifPath) => {
    console.error(err, buffer)
    fs.writeFile(flifPath, buffer, (err) => {
      console.error(err)
      tmp.tmpName({ template: path.resolve(__dirname + '/../../build/tmp-XXXXXX.png') }, (err, decodePath) => {
        console.error(err)
        nodeFLIF.decode({
          input: flifPath,
          output: decodePath,
        }, () => {
          paintingService.create(
            log.args.name,
            log.args.owner,
            log.args.id,
            log.transactionHash,
            log.args.size.toString(),
            path.basename(decodePath),
          )
        })
      })
    })
  })


  // window["libflif"].decode(buffer, (result) => {
  //   if (result.quality !== 10000) {
  //     return
  //   }

  //   painting.image = new Uint8ClampedArray(result.frames[0].data)
  //   painting.width = result.frames[0].width
  //   painting.height = result.frames[0].height

  //   resolve(painting)
  // })
})

events.on("AttemptedSend", (a) => console.log(a))

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

app.use("/", express.static(path.join(__dirname, "../../build")))

app.use("*", (req, res) => res.sendFile(path.join(__dirname, "../../build/index.html")))

io.on("connection", (socket) => {
  console.log("a user has connected")

  registerAccountListeners(socket)
  registerPaintingListeners(socket)
})

sequelize.sync()
  .then(() => http.listen(process.env.PORT || 8081, () => console.log(`eth.gallery service has started on port ${process.env.PORT || 8080}`)))
