const template = require("./painting.component.html")
import "./painting.component.sass"

import * as _ from "lodash"

import * as abiDecoder from "abi-decoder"

import BigNumber from "bignumber.js"

import { Component, Inject, OnInit } from '@angular/core'

import { Location } from "@angular/common"

import { FormGroup, FormControl, Validators } from "@angular/forms"

import { ActivatedRoute, Params, Router } from "@angular/router"

import { AccountService, PaintingService, Web3Service } from "../services"

@Component({
  selector: 'eg-painting',
  template: template,
})
export class PaintingComponent implements OnInit {
  private form: FormGroup
  private painting
  private paintingId
  private sellModalActive = false
  private selling = false

  constructor(
    @Inject(Router) private router,
    @Inject(ActivatedRoute) private activatedRoute,
    @Inject(AccountService) private accountService,
    @Inject(PaintingService) private paintingService,
    @Inject(Web3Service) private web3Service,
    @Inject(Location) private location,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.paintingId = params.id

      this.update()
    })

    this.initializeForm()
  }

  private vote(painting: any, positive: boolean) {
    painting.vote = positive
    this.paintingService.vote({ paintingId: painting.id, positive })
  }

  private update() {
    this.paintingService.get({ id: this.paintingId })
      .then((painting) => {
        painting.displayPrice = this.web3Service.web3.fromWei(painting.price, "ether")
        painting.displayAuctionPrice = this.web3Service.web3.fromWei(painting.auctionPrice, "ether")

        console.log(painting)

        this.painting = painting
      })
  }

  private buy(painting: any) {
    this.web3Service.ethGallery.buy(new BigNumber(`0x${painting.id}`).toString(), { value: new BigNumber(painting.auctionPrice).mul(1.05).toFixed(0) }, (err, result) => console.log(err, result))
  }

  private auction(): void {
    if (this.form.valid && !this.selling) {
      this.selling = true

      this.web3Service.ethGallery
        .createAuction(
          new BigNumber(`0x${this.paintingId}`).toString(),
          this.web3Service.web3.toWei(this.form.controls.startingPrice.value, "ether"),
          this.web3Service.web3.toWei(this.form.controls.endingPrice.value, "ether"),
          this.form.controls.duration.value,
          (err, res) => {
            this.selling = false

            if (err) {
              return
            }

            this.form.reset()
            this.sellModalActive = false
          },
        )
    }
  }

  private initializeForm(): void {
    this.form = new FormGroup({
      startingPrice: new FormControl("", Validators.required),
      endingPrice: new FormControl("", Validators.required),
      duration: new FormControl("", Validators.required),
    })
  }
}
