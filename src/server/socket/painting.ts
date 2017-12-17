import { Painting } from "../db"

export const registerPaintingListeners = (socket) => {
  socket.on("painting:list", (params) => {
    Painting.findAll({ offset: (params.page - 1) * 10 })
      .then((paintings) => socket.emit("painting:list", paintings))
  })
}
