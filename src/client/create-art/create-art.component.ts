const template = require("./create-art.component.html")
import "./create-art.component.sass"

import { Component, Inject } from '@angular/core'

import { SocketService, Web3Service } from "../services"

@Component({
  selector: 'eg-create-art',
  template: template,
})
export class CreateArtComponent {
  constructor() {}
}
