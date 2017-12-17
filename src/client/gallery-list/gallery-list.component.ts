const template = require("./gallery-list.component.html")
import "./gallery-list.component.sass"

import * as _ from "lodash"

import * as abiDecoder from "abi-decoder"

import { Component, Inject, OnInit } from '@angular/core'

import { ActivatedRoute, Params, Router } from "@angular/router"

import { PaintingService, Web3Service } from "../services"

@Component({
  selector: 'eg-gallery-list',
  template: template,
})
export class GalleryListComponent implements OnInit {
  private page: number
  private paintings

  constructor(
    @Inject(Router) private router,
    @Inject(ActivatedRoute) private activatedRoute,
    @Inject(PaintingService) private paintingService,
    @Inject(Web3Service) private web3Service,
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queryParams: Params) => {
      this.page = parseInt(queryParams["page"] || 1)

      this.update()
    })
  }

  private update() {
    this.paintingService.list({ page: this.page })
      .then((paintings) => {
        this.paintings = paintings
      })

    // this.updateQueryParams()
  }

  private updateQueryParams() {
    this.router.navigate(
      [],
      {
        queryParams: {
          page: this.page,
        },
      },
    )
  }
}
