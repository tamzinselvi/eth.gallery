import { NgModule } from "@angular/core"

import { SharedModule } from "../../shared.module"

import { DomainNetworkComponent } from "./domain-network/domain-network.component"

@NgModule({
  declarations: [
    DomainNetworkComponent,
  ],
  exports: [
    DomainNetworkComponent,
  ],
  imports: [
    SharedModule,
  ],
})
export class ComponentsModule { }
