const template = require("./create-account.component.html")
import "./create-account.component.sass"

import { Component, Inject } from '@angular/core'

import { Router } from "@angular/router"

import { AccountService, Web3Service } from "../services"

@Component({
  selector: 'eg-create-account',
  template: template,
})
export class CreateAccountComponent {
  public address: string
  public email: string
  public nickname: string

  constructor(
    @Inject(AccountService) private accountService,
    @Inject(Web3Service) private web3Service,
    @Inject(Router) private router,
  ) {
    this.address = web3Service.getAddress()
  }

  submit() {
    this.accountService.register(this.address, this.email, this.nickname)
      .then(() => this.router.navigate(["/"]))
  }
}
