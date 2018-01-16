const template = require("./gallery-list.component.html")
import "./gallery-list.component.sass"

import * as _ from "lodash"

import * as abiDecoder from "abi-decoder"

import { Component, Inject, OnInit } from '@angular/core'

import { Location } from "@angular/common"

import { ActivatedRoute, Params, Router } from "@angular/router"

import { AccountService, PaintingService, Web3Service } from "../services"

import { Observable } from "rxjs/Observable"

import BigNumber from "bignumber.js"

@Component({
  selector: 'eg-gallery-list',
  template: template,
})
export class GalleryListComponent implements OnInit {
  private page: number
  private search: string
  private pages: number
  private id
  private sort
  private paintings

  constructor(
    @Inject(Router) private router,
    @Inject(ActivatedRoute) private activatedRoute,
    @Inject(AccountService) private accountService,
    @Inject(PaintingService) private paintingService,
    @Inject(Web3Service) private web3Service,
    @Inject(Location) private location,
  ) {}

  ngOnInit() {
    this.sort = {}

    Observable.zip(
      this.activatedRoute.queryParams,
      this.activatedRoute.params,
    ).subscribe(([queryParams, params]) => {
      this.page = parseInt(queryParams["page"] || 1)
      this.search = queryParams["search"] || null
      this.id = params["id"]
      this.sort["popularity"] = queryParams["sort.popularity"] || null
      this.sort["age"] = queryParams["sort.age"] || null
      this.sort["name"] = queryParams["sort.name"] || null
      this.sort["price"] = queryParams["sort.price"] || null
      this.sort["auctionPrice"] = queryParams["sort.auctionPrice"] || null

      this.update()
    })
  }

  private update() {
    this.paintingService.list({ page: this.page, pageSize: 16, search: this.search, sort: this.sort, id: this.id })
      .then((result) => {
        this.paintings = result.rows.map(painting => {
          painting.displayPrice = this.web3Service.web3.fromWei(painting.price, "ether")
          painting.displayAuctionPrice = this.web3Service.web3.fromWei(painting.auctionPrice, "ether")

          return painting
        })
        console.log(this.paintings)
        this.pages = Math.ceil(result.count / 16)
      })

    this.updateQueryParams()
  }

  private vote(painting: any, positive: boolean) {
    painting.vote = positive
    this.paintingService.vote({ paintingId: painting.id, positive })
  }

  private updateQueryParams() {
    const urlTree = this.router.createUrlTree([], {
      queryParams: {
        page: this.page,
        "sort.age": this.sort["age"],
        "sort.name": this.sort["name"],
        "sort.price": this.sort["price"],
      },
      queryParamsHandling: "merge",
    })

    this.location.replaceState(urlTree)
  }

  private buy(painting: any) {
    console.log(new BigNumber(painting.auctionPrice).toFixed(0))
    this.web3Service.ethGallery.buy(new BigNumber(`0x${painting.id}`).toString(), { value: new BigNumber(painting.auctionPrice).mul(1.05).toFixed(0) }, (err, result) => console.log(err, result))
  }

  private toggleAgeSort() {
    this.sort["age"] = (this.sort["age"] === null ? 'DESC' : (this.sort["age"] === 'DESC' ? 'ASC' : null))
    this.page = 1

    this.router.navigate([], { queryParams: { "sort.age": this.sort["age"] }, queryParamsHandling: "merge", skipLocationChange: true })
  }

  private toggleNameSort() {
    this.sort["name"] = (this.sort["name"] === null ? 'DESC' : (this.sort["name"] === 'DESC' ? 'ASC' : null))
    this.page = 1

    this.router.navigate([], { queryParams: { "sort.name": this.sort["name"] }, queryParamsHandling: "merge", skipLocationChange: true })
  }

  private togglePriceSort() {
    this.sort["price"] = (this.sort["price"] === null ? 'DESC' : (this.sort["price"] === 'DESC' ? 'ASC' : null))
    this.page = 1

    this.router.navigate([], { queryParams: { "sort.price": this.sort["price"] }, queryParamsHandling: "merge", skipLocationChange: true })
  }

  private toggleAuctionPriceSort() {
    this.sort["auctionPrice"] = (this.sort["auctionPrice"] === null ? 'DESC' : (this.sort["auctionPrice"] === 'DESC' ? 'ASC' : null))
    this.page = 1

    this.router.navigate([], { queryParams: { "sort.auctionPrice": this.sort["auctionPrice"] }, queryParamsHandling: "merge", skipLocationChange: true })
  }

  private togglePopularitySort() {
    this.sort["popularity"] = (this.sort["popularity"] === null ? 'DESC' : (this.sort["popularity"] === 'DESC' ? 'ASC' : null))
    this.page = 1

    this.router.navigate([], { queryParams: { "sort.popularity": this.sort["popularity"] }, queryParamsHandling: "merge", skipLocationChange: true })
  }

  private gotoPage(page) {
    this.page = page

    this.router.navigate([], { queryParams: { page }, queryParamsHandling: "merge" })
  }
}
