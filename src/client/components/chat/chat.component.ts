const template = require("./chat.component.html")
import "./chat.component.sass"

import { Subject } from "rxjs"

import { Component, Inject, OnInit } from '@angular/core'

import { FormControl } from "@angular/forms"

import { ActivatedRoute, Router, Params } from "@angular/router"

import { AccountService, Web3Service } from "../../services"

@Component({
  selector: 'eg-chat',
  template: template,
})
export class ChatComponent implements OnInit {
  private notifications = 0
  private isOpen = false

  constructor(
    @Inject(AccountService) public accountService: AccountService,
  ) {}

  ngOnInit() {
  }
}
