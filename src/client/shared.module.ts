import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { HttpModule } from "@angular/http"
import { MdButtonModule, MdIconModule } from "@angular/material"
import { AppIconsModule } from "./app.icons"

@NgModule({
  imports: [
    HttpModule,
    CommonModule,
    MdButtonModule,
    MdIconModule,
    AppIconsModule,
  ],
  exports: [
    HttpModule,
    CommonModule,
    MdButtonModule,
    MdIconModule,
    AppIconsModule,
  ]
})
export class SharedModule {}
