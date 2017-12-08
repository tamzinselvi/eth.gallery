const template = require("./top-bar.component.html")
import "./top-bar.component.styl"

import { Component, Input } from '@angular/core'

@Component({
  selector: 'bd-top-bar',
  template: template,
})
export class TopBarComponent {
  @Input("positionAbsolute") positionAbsolute = false
  @Input("backgroundNone") backgroundNone = false
}
