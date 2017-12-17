const template = require("./top-bar.component.html")
import "./top-bar.component.sass"

import { Component, Inject } from '@angular/core'

import { Router } from "@angular/router"

import { AccountService } from "../../services"

@Component({
  selector: 'eg-top-bar',
  template: template,
})
export class TopBarComponent {
  constructor(
    @Inject(Router) public router: Router,
    @Inject(AccountService) public accountService: AccountService
  ) {}
}
