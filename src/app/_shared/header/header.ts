import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavMenu } from '../nav-menu/nav-menu';
import { RouterLink } from '@angular/router';
import { AuthService, UserService } from '@services';

@Component({
    selector: 'cu-header',
    imports: [NavMenu, RouterLink],
    templateUrl: './header.html',
    styleUrl: './header.css'
})
export class Header {
    readonly _userService = inject(UserService);
    readonly _authService = inject(AuthService);

    // Convert the Observable to a Signal
    readonly user = toSignal(this._userService.user$);

}
