import { Component } from '@angular/core';

import { ZardButtonComponent } from './button/button.component';

@Component({
  selector: 'cu-button, button[cu-button], a[cu-button]',
  exportAs: 'cuButton',
  standalone: true,
  imports: [ZardButtonComponent],
  template: ` <button z-button>Default</button> `,
})
export class CuButtonDefaultComponent {}
