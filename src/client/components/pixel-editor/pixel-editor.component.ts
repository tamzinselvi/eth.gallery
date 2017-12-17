const template = require("./pixel-editor.component.html")
import "./pixel-editor.component.sass"

import { FormGroup, FormControl, Validators } from "@angular/forms"

import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core'

import { Router } from "@angular/router"

import * as elementResizeDetectorMaker from "element-resize-detector"
import * as abiDecoder from "abi-decoder"

import { AccountService, Web3Service } from "../../services"

const GWEI = 1000000000

@Component({
  selector: 'eg-pixel-editor',
  template: template,
})
export class PixelEditorComponent implements OnInit {
  private form: FormGroup
  private canvas
  private mouseDown = false
  private scale = 10
  private offset = [0, 0]
  private lastPos
  private mode = "EDIT"
  private rerender = true
  private colorInput
  private pixelColor = "#000000"
  private width = 64
  private height = 64
  private uploadModalActive = false
  private buffer
  private ctx
  private imageCanvas
  private imageContext
  private uploading = false

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef,
    @Inject(Router) public router: Router,
    @Inject(AccountService) public accountService: AccountService,
    @Inject(Web3Service) private web3Service: Web3Service,
  ) {
    this.buffer = new Array(this.width * this.height)
    this.buffer.fill("#ffffff")
  }

  ngOnInit() {
    this.canvas = this.elementRef.nativeElement.querySelector("canvas")
    this.colorInput = this.elementRef.nativeElement.querySelector("input[type='color']")
    this.ctx = this.canvas.getContext("2d")

    this.imageCanvas = document.createElement("canvas")
    this.imageCanvas.width = this.width
    this.imageCanvas.height = this.height

    this.imageContext = this.imageCanvas.getContext("2d")

    this.imageContext.beginPath()
    this.imageContext.rect(0, 0, this.width, this.height)
    this.imageContext.fillStyle = "rgb(255, 255, 255)"
    this.imageContext.fill()

    this.initializeForm()
    this.initializeCanvas()
  }

  upload() {
    if (!this.form.valid || this.uploading) {
      for (let inner in this.form.controls) {
        this.form.get(inner).markAsTouched()
        this.form.get(inner).updateValueAndValidity()
      }

      return
    }

    this.uploading = true

    const pad = (s, n) => {
      return "0".repeat(n - s.length) + s
    }

    const data = Uint8Array.from(
      this.buffer.map(
        h => [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16), 255]
      ).reduce(
        (a, b) => a.concat(b), []
      )
    )

    console.log(data)

    window["libflif"].encode({
      frames: [{
        data: data.buffer,
        depth: 24,
        width: this.width,
        height: this.height,
      }],
      options: {
        alpha: false,
      }
    }).then((encodedBuffer) => {
      const hB32 = []

      const hB = Array.prototype.map.call(new Uint8Array(encodedBuffer), x => pad(x.toString(16), 2))

      const hBLength = hB.length

      while (hB.length > 0) {
        let splice = hB.splice(0, 32)

        hB32.push("0x" + pad(splice.reduce((p, c) => p + c, ""), 64))
      }

      this.web3Service.ethGallery.createPainting.sendTransaction(hB32, hBLength, this.form.controls.name.value, { value: hBLength * GWEI }, (err, res) => {
        this.form.reset()
        this.uploading = false
        this.uploadModalActive = false
      })
    }).catch(err => {
      this.uploading = false
    })
  }

  private initializeCanvas(): void {
    this.colorInput.addEventListener("change" , (e) => {
      this.pixelColor = this.colorInput.value.toString()
    })

    this.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault()

      this.mouseDown = true

      if (this.mode === "EDIT") {
        this.draw(e)
      }
      else if (this.mode === "PAINT") {
        this.paint(e)
      }
      else {
        this.lastPos = [e.offsetX, e.offsetY]
      }
    })

    this.canvas.addEventListener("mousemove", (e) => {
      e.preventDefault()

      if (this.mouseDown) {
        if (this.mode === "EDIT") {
          this.draw(e)
        }
        else if (this.mode === "MOVE") {
          this.offset = [
            Math.min(
              this.width * this.scale / 2,
              Math.max(
                -this.width * this.scale / 2,
                this.offset[0] + (e.offsetX - this.lastPos[0]),
              ),
            ),
            Math.min(
              this.height * this.scale / 2,
              Math.max(
                -this.height * this.scale / 2,
                this.offset[1] + (e.offsetY - this.lastPos[1]),
              ),
            ),
          ]

          this.lastPos = [e.offsetX, e.offsetY]
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
          this.rerender = true
        }
      }
    })

    this.canvas.addEventListener("mouseup", (e) => {
      e.preventDefault()

      this.mouseDown = false
    })

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault()

      if (this.mouseDown) {
        return
      }

      if ((-e.deltaY || -e.detail) > 0) {
        this.zoomIn()
      }
      else {
        this.zoomOut()
      }
    })

    const erd = elementResizeDetectorMaker()

    erd.listenTo(this.canvas.parentElement, () => {
      this.syncCanvasDimensions()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.rerender = true
    })

    this.syncCanvasDimensions()

    this.render()
  }

  private draw(e): void {
    const left = (this.canvas.width - this.width * this.scale) / 2 + this.offset[0]
    const right = (this.canvas.width + this.width * this.scale) / 2 + this.offset[0]
    const bottom = (this.canvas.height - this.height * this.scale) / 2 + this.offset[1]
    const top = (this.canvas.height + this.height * this.scale) / 2 + this.offset[1]


    if (e.offsetX >= left && e.offsetX < right && e.offsetY >= bottom && e.offsetY < top) {
      const x = Math.floor((e.offsetX - left) / this.scale)
      const y = Math.floor((e.offsetY - bottom) / this.scale)

      this.buffer[x + y * this.width] = this.pixelColor

      this.imageContext.beginPath()
      this.imageContext.rect(x, y, 1, 1)
      this.imageContext.fillStyle = this.pixelColor
      this.imageContext.fill()

      this.rerender = true
    }
  }

  private paint(e): void {
    const left = (this.canvas.width - this.width * this.scale) / 2 + this.offset[0]
    const right = (this.canvas.width + this.width * this.scale) / 2 + this.offset[0]
    const bottom = (this.canvas.height - this.height * this.scale) / 2 + this.offset[1]
    const top = (this.canvas.height + this.height * this.scale) / 2 + this.offset[1]

    if (e.offsetX >= left && e.offsetX < right && e.offsetY >= bottom && e.offsetY < top) {
      const x = Math.floor((e.offsetX - left) / this.scale)
      const y = Math.floor((e.offsetY - bottom) / this.scale)

      this.paintHelper(x, y, this.buffer[x + y * this.width], this.pixelColor)
      this.rerender = true
    }
  }

  private paintHelper(x0, y0, startColor, fillColor) {
    const queue = [[x0, y0]]
    while (queue.length > 0) {
      const item = queue.pop()
      const [x, y] = item

      if (x >= 0 && x < this.width && y >= 0 && y < this.height && this.buffer[x + y * this.width] !== fillColor && this.buffer[x + y * this.width] === startColor) {
        this.buffer[x + y * this.width] = fillColor


        this.imageContext.beginPath()
        this.imageContext.rect(x, y, 1, 1)
        this.imageContext.fillStyle = fillColor
        this.imageContext.fill()

        queue.push([x - 1, y])
        queue.push([x + 1, y])
        queue.push([x, y - 1])
        queue.push([x, y + 1])
      }
    }
  }

  private zoomIn(): void {
    this.scale = Math.min(100, this.scale + 1)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.rerender = true
  }

  private zoomOut(): void {
    this.scale = Math.max(1, this.scale - 1)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.rerender = true
  }

  private render(): void {
    const left = (this.canvas.width - this.width * this.scale) / 2 + this.offset[0]
    const bottom = (this.canvas.height - this.height * this.scale) / 2 + this.offset[1]

    let x, y, h

    if (this.rerender) {
      for (let i = 0; i < this.buffer.length; i++) {
        h = this.buffer[i]

        x = i % this.width
        y = Math.floor(i / this.width)

        this.ctx.beginPath()
        this.ctx.rect(Math.round(left + x * this.scale), Math.round(bottom + y * this.scale), this.scale, this.scale)
        this.ctx.fillStyle = h
        this.ctx.fill()
      }
    }

    this.rerender = false

    requestAnimationFrame(this.render.bind(this))
  }

  private syncCanvasDimensions(): void {
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
  }

  private initializeForm(): void {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
    })
  }
}
