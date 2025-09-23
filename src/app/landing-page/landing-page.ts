import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZardButtonComponent } from "@app/_shared/components/button/button.component";

@Component({
  selector: 'cu-landing-page',
  imports: [ZardButtonComponent],
  templateUrl: 'landing-page.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPage {
  authDialogOpen = false;

  setAuthDialogOpen(isOpen: boolean): void {
    this.authDialogOpen = isOpen;
  }

  subscribe() {
    alert('Method not implemented.');
  }
}
