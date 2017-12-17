import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { HttpModule } from "@angular/http"
import { MatButtonModule, MatIconModule } from "@angular/material"
import { AppIconsModule } from "./app.icons"
import { RouterModule, Routes } from "@angular/router"

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    AppIconsModule,
    RouterModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    AppIconsModule,
    RouterModule,
  ]
})
export class SharedModule {}
