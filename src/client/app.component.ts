const template = require("./app.component.html")

import "@angular/material/prebuilt-themes/indigo-pink.css"
import "./app.component.styl"

import { Component, ViewEncapsulation } from '@angular/core'

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  template: template,
})
export class AppComponent {}
