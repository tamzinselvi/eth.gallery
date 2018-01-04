const template = require("./account.component.html")
import "./account.component.sass"

import { Component, Inject, OnInit } from '@angular/core'

import { Router } from "@angular/router"

import { AccountService, Web3Service } from "../services"

@Component({
  selector: 'eg-account',
  template: template,
})
export class AccountComponent implements OnInit {
  private address
  private isRegistered
  private isLoaded = false

  constructor(
    @Inject(AccountService) private accountService,
    @Inject(Web3Service) private web3Service,
    @Inject(Router) private router,
  ) {
    this.address = web3Service.getAddress()
  }

  ngOnInit() {
    this.accountService.isRegistered(this.address)
      .then(isRegistered => {
        this.isRegistered = isRegistered
        this.isLoaded = true
      })
  }
}
