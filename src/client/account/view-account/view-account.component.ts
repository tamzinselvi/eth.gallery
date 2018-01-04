const template = require("./view-account.component.html")
import "./view-account.component.sass"

import { Component, Inject } from '@angular/core'

import { Router } from "@angular/router"

import { AccountService } from "../../services"

@Component({
  selector: 'eg-view-account',
  template: template,
})
export class ViewAccountComponent {
  private account

  constructor(
    @Inject(AccountService) private accountService,
    @Inject(Router) private router,
  ) {
    this.account = accountService.account
    console.log(this.account)
  }

  signOut() {
    this.accountService.logout()
      .then(() => this.router.navigate(["/"]))
  }
}
