import * as utils from "ethereumjs-util"

import { Account } from "../db"

const getAddressFromSignature = (sig): string => {
  let recoveredAddress

  try {
    const res = utils.fromRpcSig(sig)

    const msg = utils.hashPersonalMessage(utils.toBuffer("ETH.gallery"))

    const pub = utils.ecrecover(msg, res.v, res.r, res.s)

    recoveredAddress = '0x' + utils.pubToAddress(pub).toString('hex')
  }
  catch (err) {
    console.error(err)
  }

  return recoveredAddress
}

export const registerAccountListeners = (socket) => {
  socket.on("account:me", () => {
    if (socket.request.session.account) {
      return Account.findById(socket.request.session.account)
        .then((account) => socket.emit("account:me", account))
    }

    socket.emit("account:me", null)
  })

  socket.on("account:login", (address, sig) => {
    if (socket.request.session.account) {
      return
    }

    Account.findOne({ where: { address } })
      .then((account) => {
        if (!account) {
          return socket.emit("account:login", false)
        }

        if (address !== getAddressFromSignature(sig)) {
          return socket.emit("account:login", false)
        }

        socket.request.session.account = account.id

        socket.request.session.save(() => {
          socket.emit("account:login", true)
        })
      })
  })

  socket.on("account:logout", () => {
    delete socket.request.session["account"]

    socket.request.session.save(() => {
      socket.emit("account:logout", true)
    })
  })

  socket.on("account:register", (address, email, nickname, sig) => {
    if (socket.request.session.account) {
      return socket.emit("account:register", false)
    }

    if (address === getAddressFromSignature(sig)) {
      Account.findOne({ where: { address } })
        .then((account) => {
          if (account) {
            return socket.emit("account:register", true)
          }

          Account.create({ address, email, nickname })
            .then((account) => {
              socket.request.session.account = account.id

              socket.request.session.save(() => {
                socket.emit("account:register", true)
              })
            })
        })
    }
  })
}
