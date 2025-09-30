import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';

import { ZardMenuModule } from '../components/menu/menu.module';
import { ZardButtonComponent } from '../components/button/button.component';
import { UserService, AuthService } from '@services';
import { toSignal } from '@angular/core/rxjs-interop';
 
@Component({
  selector: 'cu-nav-menu',
  imports: [ZardMenuModule, ZardButtonComponent, RouterLink],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css'
})
export class NavMenu {
    readonly _userService = inject(UserService);
    readonly _authService = inject(AuthService);
    readonly _router = inject(Router);

    // readonly user = signal(this._userService.user$);
    user$ = this._userService.user$;

    // Convert the Observable to a Signal
    readonly user = toSignal(this.user$);

    settingsSelected() {
        console.log('settingsSelected method not implemented.');
    }
    aboutSelected() {
        console.log('aboutSelected method not implemented.');
    }
    practiceSelected() {
        console.log('practiceSelected method not implemented.');
    }
    watchSelected() {
        console.log('watchSelected method not implemented.');
    }

    logOut() {
        this._authService.logOut();
        this._router.navigate(['/']);
    }
  
}
