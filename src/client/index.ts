import "./polyfills"
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import "./fonts"

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);

export default {}
