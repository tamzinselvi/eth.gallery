const template = require("./top-bar.component.html")
import "./top-bar.component.sass"

import { Subject } from "rxjs"

import { Component, Inject, OnInit } from '@angular/core'

import { FormControl } from "@angular/forms"

import { ActivatedRoute, Router, Params } from "@angular/router"

import { AccountService } from "../../services"

@Component({
  selector: 'eg-top-bar',
  template: template,
})
export class TopBarComponent implements OnInit {
  private searchControl = new FormControl()
  private search
  private debouncer = new Subject()
  private skipDebounce = false
  constructor(
    @Inject(ActivatedRoute) private activatedRoute,
    @Inject(Router) public router: Router,
    @Inject(AccountService) public accountService: AccountService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queryParams: Params) => {
      this.search = queryParams["search"] || ""
    })

    this.debouncer
      .debounceTime(1000)
      .subscribe(search => {
        if (!this.skipDebounce) {
          this.router.navigate(["/gallery"], { queryParams: { search: (this.search.length ? this.search : null) }, queryParamsHandling: "merge" })
        }
      })

    this.searchControl.valueChanges
      .subscribe(search => {
        this.search = search
        this.skipDebounce = false
        this.debouncer.next(search)
      })
  }

  onEnter() {
    this.router.navigate(["/gallery"], { queryParams: { search: (this.search.length ? this.search : null) }, queryParamsHandling: "merge" })
    this.skipDebounce = true
  }
}
