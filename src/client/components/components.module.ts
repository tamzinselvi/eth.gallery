import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"

import { TopBarComponent } from "./top-bar/top-bar.component"

@NgModule({
  declarations: [
    TopBarComponent,
  ],
  exports: [
    TopBarComponent,
  ],
  imports: [
    SharedModule,
  ],
  providers: [],
})
export class ComponentsModule { }
