const template = require("./sign-in.component.html")
import "./sign-in.component.sass"

import { Component, Inject } from '@angular/core'

import { Router } from "@angular/router"

import { AccountService } from "../../services"

@Component({
  selector: 'eg-sign-in',
  template: template,
})
export class SignInComponent {
  constructor(
    @Inject(AccountService) private accountService,
    @Inject(Router) private router,
  ) {}

  signIn() {
    this.accountService.login()
      .then(() => this.router.navigate(["/account"]))
  }
}
