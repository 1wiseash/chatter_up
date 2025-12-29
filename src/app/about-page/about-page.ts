import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services';

@Component({
  selector: 'cu-about-page',
  imports: [RouterLink],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css'
})
export class AboutPage {
  readonly _authService = inject(AuthService);
  readonly loggedIn = this._authService.loggedIn;

}
