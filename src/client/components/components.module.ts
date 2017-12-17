import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"

import { TopBarComponent } from "./top-bar/top-bar.component"
import { PixelEditorComponent } from "./pixel-editor/pixel-editor.component"
import { PaintingComponent } from "./painting/painting.component"

@NgModule({
  declarations: [
    TopBarComponent,
    PixelEditorComponent,
    PaintingComponent,
  ],
  exports: [
    TopBarComponent,
    PixelEditorComponent,
    PaintingComponent,
  ],
  imports: [
    SharedModule,
  ],
  providers: [],
})
export class ComponentsModule { }
