import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"
import { ComponentsModule } from "../components/components.module"

import { PaintingComponent } from "./painting.component"

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule,
  ],
  declarations: [
    PaintingComponent,
  ],
})
export class PaintingModule { }
