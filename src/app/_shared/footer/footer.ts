import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '@services';

@Component({
  selector: 'cu-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
    readonly _userService = inject(UserService);

    // Convert the Observable to a Signal
    readonly user = toSignal(this._userService.user$);
}
