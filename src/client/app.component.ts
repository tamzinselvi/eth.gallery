const template = require("./app.component.html")

import "font-awesome/css/font-awesome.css"
import "./icons.css"
import "./app.component.sass"

import { Component, Inject, ViewEncapsulation } from '@angular/core'
import { Router } from "@angular/router"

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  template: template,
})
export class AppComponent {
  constructor(@Inject(Router) public router: Router) {}
}
