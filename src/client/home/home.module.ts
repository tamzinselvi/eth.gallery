import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"
import { HomeComponent } from "./home.component"
import { ComponentsModule } from "./components/components.module"

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    SharedModule,
    ComponentsModule,
  ],
  providers: [],
})
export class HomeModule { }
