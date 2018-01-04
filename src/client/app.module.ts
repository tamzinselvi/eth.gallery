import { BrowserModule } from "@angular/platform-browser"
import { RouterModule, Routes } from "@angular/router"
import { APP_INITIALIZER, NgModule } from "@angular/core"

import { SharedModule } from "./shared.module"

import { AppComponent } from "./app.component"
import { ComponentsModule } from "./components/components.module"

import { HomeComponent, HomeModule } from "./home"

import { AccountComponent, AccountModule } from "./account"

import { CreateArtComponent, CreateArtModule } from "./create-art"

import { GalleryListComponent, GalleryListModule } from "./gallery-list"

import { PaintingComponent, PaintingModule } from "./painting"

import { SocketService, Web3Service, AccountService, PaintingService } from "./services"

const appRoutes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "account",
    component: AccountComponent,
    children: [
      { path: '', component: AccountOverview },
      { path: 'galleries', component: AccountGallery }
    ],
  },
  {
    path: "create-art",
    component: CreateArtComponent,
  },
  {
    path: "gallery",
    component: GalleryListComponent,
  },
  {
    path: "painting/:id",
    component: PaintingComponent,
  },
  // { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    SharedModule,
    ComponentsModule,
    HomeModule,
    AccountModule,
    CreateArtModule,
    GalleryListModule,
    PaintingModule,
  ],
  providers: [
    SocketService,
    {
      provide: APP_INITIALIZER,
      useFactory: (socketService: SocketService) => () => socketService.load(),
      deps: [SocketService],
      multi: true
    },
    Web3Service,
    {
      provide: APP_INITIALIZER,
      useFactory: (web3Service: Web3Service) => () => web3Service.load(),
      deps: [Web3Service],
      multi: true
    },
    AccountService,
    {
      provide: APP_INITIALIZER,
      useFactory: (accountService: AccountService) => () => accountService.load(),
      deps: [AccountService],
      multi: true
    },
    PaintingService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export * from "./home"
