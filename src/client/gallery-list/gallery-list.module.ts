import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"
import { ComponentsModule } from "../components/components.module"

import { GalleryListComponent } from "./gallery-list.component"

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule,
  ],
  declarations: [
    GalleryListComponent,
  ],
})
export class GalleryListModule { }
