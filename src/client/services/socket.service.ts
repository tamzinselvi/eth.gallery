import * as io from "socket.io-client"

import { Injectable } from "@angular/core"

@Injectable()
export class SocketService {
  public socket: any

  load(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket = io()

      this.socket.on("connect", () => {
        resolve()
      })
    })
  }
}
