import { Inject, Injectable } from "@angular/core"

import { SocketService } from "./socket.service"

@Injectable()
export class PaintingService {
  public loggedIn: boolean
  public painting

  constructor(
    @Inject(SocketService) private socketService: SocketService,
  ) {}

  list(params): Promise<any> {
    return new Promise((resolve, reject) => {
      const onList = (paintings) => {
        this.socketService.socket.removeListener("painting:list", onList)
        resolve(paintings)
      }

      this.socketService.socket.on("painting:list", onList)
      this.socketService.socket.emit("painting:list", params)
    })
  }

  get(params): Promise<any> {
    return new Promise((resolve, reject) => {
      const onGet = (paintings) => {
        this.socketService.socket.removeListener("painting:get", onGet)
        resolve(paintings)
      }

      this.socketService.socket.on("painting:get", onGet)
      this.socketService.socket.emit("painting:get", params)
    })
  }

  vote(params): Promise<any> {
    return new Promise((resolve, reject) => {
      const onVote = (vote) => {
        this.socketService.socket.removeListener("painting:vote", onVote)
        resolve(vote)
      }

      this.socketService.socket.on("painting:vote", onVote)
      this.socketService.socket.emit("painting:vote", params)
    })
  }
}
