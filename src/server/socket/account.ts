import { accountService } from "../services"

export const registerAccountListeners = (socket) => {
  socket.on("account:me", () => {
    if (socket.request.session.account) {
      return accountService.getById(socket.request.session.account)
        .then(account => socket.emit("account:me", account))
    }

    socket.emit("account:me", null)
  })

  socket.on("account:login", (address, sig) => {
    if (socket.request.session.account) {
      return
    }

    accountService.login(address, sig)
      .then(account => {
        if (account) {
          socket.request.session.account = address
          socket.request.session.save()
        }
        socket.emit("account:login", account)
      })
  })

  socket.on("account:logout", () => {
    if (!socket.request.session.account) {
      return
    }

    delete socket.request.session["account"]

    socket.request.session.save(() => {
      socket.emit("account:logout", true)
    })
  })

  socket.on("account:isRegistered", (address) => {
    accountService.getById(address)
      .then(account => socket.emit("account:isRegistered", !!account))
  })

  socket.on("account:register", (address, email, nickname, sig) => {
    if (socket.request.session.account) {
      return
    }

    accountService.create(address, email, nickname, sig)
      .then(account => socket.emit("account:register", account))
  })
}
