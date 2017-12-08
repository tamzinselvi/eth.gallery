import { Component, ViewChild } from '@angular/core'

import * as _ from "lodash"
import * as elementResizeDetectorMaker from "element-resize-detector"

const template = require("./domain-network.component.html")
import "./domain-network.component.styl"

@Component({
  selector: 'bd-domain-network',
  template: template,
})
export class DomainNetworkComponent {
  @ViewChild("svg") svg
  nodes: any[]
  lines: any[]
  containerWidth: number = 0
  containerHeight: number = 0
  clearTickInterval

  ngOnInit() {
    this.nodes = []
    this.lines = []

    for (let i = 0; i < 100; i++) {
      this.nodes.push({
        rotation: Math.random() < .5 ? (1 + Math.random()) : (-1 - Math.random()),
        fill: Math.random() < .05 ? "#ff0000" : "#5761dd",
        angle: Math.random() * 2 * Math.PI,
        spread: Math.random(),
        opacity: 1,
      })
    }

    for (let i = 0; i < 100; i++) {
      const source = this.nodes[Math.floor(Math.random() * this.nodes.length)]
      const target = this.nodes[Math.floor(Math.random() * this.nodes.length)]
      this.lines.push({
        source,
        target,
        stroke: (source.fill === "#ff0000" || target.fill === "#ff0000")
          ? "#ff0000"
          : "#5761dd",
        opacity: Math.random() / 2 + 0.05,
      })
    }

    const svgBB = this.svg.nativeElement.getBoundingClientRect()
    this.containerWidth = svgBB.width
    this.containerHeight = svgBB.height

    const erd = elementResizeDetectorMaker({
      strategy: "scroll"
    })

    erd.listenTo(this.svg.nativeElement.parentNode, (element) => {
      const svgBB = this.svg.nativeElement.getBoundingClientRect()
      this.containerWidth = svgBB.width
      this.containerHeight = svgBB.height
    })

    this.clearTickInterval = setInterval(this.tick.bind(this), 100)
  }

  ngOnDestroy() {
    this.clearTickInterval()
  }

  tick() {
    this.nodes.forEach((node) => {
      node.angle += node.rotation * Math.PI / 5000
    })

    if (Math.random() < .02) {
      const removedNode = this.nodes[Math.floor(Math.random() * this.nodes.length)]
      const removedLines = _.filter(this.lines, (line) => (removedNode === line.source || removedNode === line.target))

      const newNode = {
        rotation: Math.random() < .5 ? 1 : -1,
        fill: Math.random() < .05 ? "#ff0000" : "#5761dd",
        angle: Math.random() * 2 * Math.PI,
        spread: Math.random(),
        opacity: 1,
      }

      const roll = Math.random()
      let newLines = 0

      if (roll < .1) {
        newLines = 3
      }
      else if (roll < .2) {
        newLines = 2
      }
      else if (roll < .7) {
        newLines = 1
      }

      for (let i = 0; i < newLines; i++) {
        const source = this.nodes[Math.floor(Math.random() * this.nodes.length)]
        this.lines.push({
          source,
          target: newNode,
          stroke: (source.fill === "#ff0000" || newNode.fill === "#ff0000")
            ? "#ff0000"
            : "#5761dd",
          opacity: Math.random() / 2 + 0.05,
        })
      }

      this.nodes.push(newNode)

      const flutter = (next) => {
        removedNode.opacity = 1
        removedLines.forEach((line) => line.opacity = 1)

        setTimeout(() => {
          removedNode.opacity = 0
          removedLines.forEach((line) => line.opacity = 0)

          setTimeout(() => next(), 500)
        }, 500)
      }

      let iterations = 5

      const cycle = () => {
        if (iterations > 0) {
          iterations--
          flutter(cycle)
        }
        else {
          _.remove(this.nodes, removedNode)
          _.remove(this.lines, (line) => (removedNode === line.source || removedNode === line.target))
        }
      }

      cycle()
    }
  }

  getNodeCx(node) {
    const halfWidth = this.containerWidth / 2
    return halfWidth - halfWidth * node.spread * Math.cos(node.angle)
  }

  getNodeCy(node) {
    const halfHeight = this.containerHeight / 2
    return halfHeight - halfHeight * node.spread * Math.sin(node.angle)
  }
}
