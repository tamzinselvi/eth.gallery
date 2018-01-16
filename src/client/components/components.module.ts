import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"

import { TopBarComponent } from "./top-bar/top-bar.component"
import { PixelEditorComponent } from "./pixel-editor/pixel-editor.component"
import { PaintingComponent } from "./painting/painting.component"
import { ChatComponent } from "./chat/chat.component"

@NgModule({
  declarations: [
    TopBarComponent,
    PixelEditorComponent,
    PaintingComponent,
    ChatComponent,
  ],
  exports: [
    TopBarComponent,
    PixelEditorComponent,
    PaintingComponent,
    ChatComponent,
  ],
  imports: [
    SharedModule,
  ],
  providers: [],
})
export class ComponentsModule { }
