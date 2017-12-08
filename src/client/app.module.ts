import { BrowserModule } from "@angular/platform-browser"
import { RouterModule, Routes } from "@angular/router"
import { NgModule } from "@angular/core"
import { SharedModule } from "./shared.module"

import { AppComponent } from "./app.component"

import { ComponentsModule } from "./components/components.module"
import { HomeModule } from "./home/home.module"

import { HomeComponent } from "./home/home.component"

const appRoutes: Routes = [
  {
    path: "",
    component: HomeComponent,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
