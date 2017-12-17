import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"
import { ComponentsModule } from "../components/components.module"

import { CreateArtComponent } from "./create-art.component"

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule,
  ],
  declarations: [
    CreateArtComponent,
  ],
})
export class CreateArtModule { }
