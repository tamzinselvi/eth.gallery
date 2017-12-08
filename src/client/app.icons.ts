const protectUserIconUrl = require('./resources/icons/protect-user.svg')
const scannerIconUrl = require('./resources/icons/scanner.svg')
const throwawayIconUrl = require('./resources/icons/throwaway.svg')

import { Inject, NgModule } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { MdIconRegistry } from '@angular/material'

@NgModule({})
export class AppIconsModule {
  constructor(
    @Inject(MdIconRegistry) private mdIconRegistry: MdIconRegistry,
    @Inject(DomSanitizer) private sanitizer: DomSanitizer,
  ) {
    console.log(protectUserIconUrl, scannerIconUrl, throwawayIconUrl)
    console.log(sanitizer.bypassSecurityTrustResourceUrl(protectUserIconUrl))
    mdIconRegistry
        .addSvgIconInNamespace('bad-domains', 'protect-user',
            sanitizer.bypassSecurityTrustResourceUrl(protectUserIconUrl))
        .addSvgIconInNamespace('bad-domains', 'scanner',
            sanitizer.bypassSecurityTrustResourceUrl(scannerIconUrl))
        .addSvgIconInNamespace('bad-domains', 'throwaway',
            sanitizer.bypassSecurityTrustResourceUrl(throwawayIconUrl))
  }
}
