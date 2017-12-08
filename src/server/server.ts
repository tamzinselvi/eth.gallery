import * as Express from "express"
import * as HTTP from "http"
import * as Path from "path"
import * as BodyParser from "body-parser"

import routes from "./route/"

class Server {
  start(): Express {
    const app = Express()
    app.use(BodyParser.json())
    const server = HTTP.createServer(app)
    // app.use('/assets', Express["static"]("./assets"));
    // app.use('/client', Express["static"]('src/client'));
    // app.use('/resources', Express["static"]('resources'));
    // app.use('/privacy.html', Express.static(__dirname + '/../../privacy.html'));
    // app.use('/contact.html', Express.static(__dirname + '/../../contact.html'));
    // app.use('/leaderboard.html', Express.static(__dirname + '/../../leaderboard.html'));
    // const io = SocketIO(server)
    // io.on("connection", (socket) => {
    //   console.log("player connected")
    //   const player = new MRRServerPlayer("Anon", socket, this)
    //   const unit = new Unit(new Vector2D(1, 0))
    //   unit.setPlayer(player)
    //   this.space.insert(unit)
    //   player.addEnt(unit)
    //   this.addPlayer(player)
    //   socket.emit('setPlayerId', player.getId())
    //   socket.on("disconnect", () => {
    //     this.removePlayer(player)
    //     return
    //   })
    //   socket.on("error", (err) => {
    //     log("ERROR", err)
    //     console.error(err)
    //   })
    // })
    const port = process.env.PORT || 1337
    server.listen(port, () => {
      return console.log("listening on port ", port)
    })

    if (process.env.NODE_ENV !== "production") {
      const webpack = require("webpack")
      const webpackMiddleware = require("webpack-dev-middleware")
      const webpackHotMiddleware = require("webpack-hot-middleware")
      const webpackConfig = require("../../webpack.config.js")

      webpackConfig.output.publicPath = "/build/"

      webpackConfig.entry = [
        "webpack-hot-middleware/client",
        webpackConfig.entry,
      ]

      webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

      const compiler = webpack(webpackConfig)

      app.use(webpackMiddleware(compiler, {
        publicPath: "/build/",
        noInfo: true,
        hot: true,
        watchOptions: {
          aggregateTimeout: 300,
          poll: true,
        },
        stats: {
          colors: true,
        },
        reporter: null,
      }))

      app.use(webpackHotMiddleware(compiler, {
        publicPath: "/build/",
      }))
    }
    else {
      app.use('/build', Express.static(__dirname + '/../../build'));
    }

    app.use(routes)

    app.get("*", (req, res) => {
      res.sendFile(Path.resolve(__dirname + "/../../index.html"))
    })

    return app
  }
}

export default Server
