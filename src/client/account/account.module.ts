import { NgModule } from "@angular/core"

import { SharedModule } from "../shared.module"
import { ComponentsModule } from "../components/components.module"

import { AccountComponent } from "./account.component"
import { CreateAccountComponent } from "./create-account/create-account.component"
import { SignInComponent } from "./sign-in/sign-in.component"
import { ViewAccountComponent } from "./view-account/view-account.component"
import { GetMetamaskComponent } from "./get-metamask/get-metamask.component"
import { UnlockMetamaskComponent } from "./unlock-metamask/unlock-metamask.component"

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule,
  ],
  declarations: [
    AccountComponent,
    CreateAccountComponent,
    SignInComponent,
    ViewAccountComponent,
    GetMetamaskComponent,
    UnlockMetamaskComponent,
  ],
})
export class AccountModule { }
