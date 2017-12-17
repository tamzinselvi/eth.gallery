import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"
import { ComponentsModule } from "../components/components.module"

import { CreateAccountComponent } from "./create-account.component"

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule,
  ],
  declarations: [
    CreateAccountComponent,
  ],
})
export class CreateAccountModule { }
