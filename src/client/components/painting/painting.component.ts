const template = require("./painting.component.html")
import "./painting.component.sass"

import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core'

@Component({
  selector: 'eg-painting',
  template: template,
})
export class PaintingComponent implements OnInit {
  @ViewChild("canvas") private canvas
  @Input("painting") private painting
  private context

  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext("2d")
    this.canvas.nativeElement.width = this.painting.width
    this.canvas.nativeElement.height = this.painting.height

    const imageData = new ImageData(this.painting.image, this.painting.width, this.painting.height)

    // console.log(this.painting)

    // for (let i = 0; i < this.painting.image.length; i += 4) {
    //   imageData.data[i] = this.painting.image[i]
    //   imageData.data[i + 1] = this.painting.image[i + 1]
    //   imageData.data[i + 2] = this.painting.image[i + 2]
    //   imageData.data[i + 3] = 255
    // }

    this.context.putImageData(imageData, 0, 0, 0, 0, this.painting.width, this.painting.height)
  }
}
