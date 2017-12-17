import { NgModule } from "@angular/core"

import { HomeComponent } from "./home.component"
import { SharedModule } from "../shared.module"
import { ComponentsModule } from "../components/components.module"

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule,
  ],
  declarations: [
    HomeComponent,
  ],
  providers: [],
})
export class HomeModule { }
