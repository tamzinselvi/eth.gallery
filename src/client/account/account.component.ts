const template = require("./account.component.html")
import "./account.component.sass"

import { Rx } from "rx"

import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core'

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
    @Inject(ChangeDetectorRef) private changeDetectorRef,
  ) {}

  ngOnInit() {
    Rx.Observable
      .ofObjectChanges(this.web3Service.web3.eth.accounts)
      .subscribe(() => this.changeDetectorRef.detectChanges())

    if (this.web3Service.web3) {
      this.address = this.web3Service.getAddress()

      this.accountService.isRegistered(this.address)
        .then(isRegistered => {
          this.isRegistered = isRegistered
          this.isLoaded = true
        })
    }
    else {
      this.isLoaded = true
    }
  }
}
