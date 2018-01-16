const template = require("./account.component.html")
import "./account.component.sass"

import * as _ from "lodash"

import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core'

import { Router } from "@angular/router"

import { CreateAccountComponent } from "./create-account/create-account.component"

import { AccountService, Web3Service } from "../services"

@Component({
  selector: 'eg-account',
  template: template,
})
export class AccountComponent implements OnInit, OnDestroy {
  private address
  private isRegistered
  private isLoaded = false
  private watchInterval
  private lastAccounts
  @ViewChild("createAccount") createAccountComponent: CreateAccountComponent

  constructor(
    @Inject(AccountService) private accountService,
    @Inject(Web3Service) private web3Service,
    @Inject(Router) private router,
    @Inject(ChangeDetectorRef) private changeDetectorRef,
  ) {}

  ngOnInit() {
    this.watchInterval = setInterval(() => {
      if (this.web3Service.web3 && this.web3Service.web3.eth) {
        this.web3Service.web3.eth.getAccounts((err, accounts) => {
          if (err) {
            return
          }

          if (!_.isEqual(this.lastAccounts, accounts)) {
            this.lastAccounts = accounts
            this.web3Service.web3.eth.defaultAccount = _.first(accounts)

            this.update()

            console.log("HUH", this)

            if (this.createAccountComponent) {
              this.createAccountComponent.update()
            }
          }
        })
      }
    }, 1000)

    if (this.web3Service.web3) {
      this.update()
    }
    else {
      this.isLoaded = true
    }
  }

  update() {
    this.accountService.isRegistered(this.web3Service.web3.eth.defaultAccount)
      .then(isRegistered => {
        this.isRegistered = isRegistered
        this.isLoaded = true
      })
  }

  ngOnDestroy() {
    clearInterval(this.watchInterval)
  }
}
